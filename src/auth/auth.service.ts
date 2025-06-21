import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginTicket, OAuth2Client } from "google-auth-library";
import dayjs from "dayjs";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findOne({ email: username });
    if (!user) {
      return null;
    }

    if (!user.password) {
      throw new UnauthorizedException(
        "This user does not have a password set. Please use Google login."
      );
    }

    const isPasswordMatch = await bcrypt.compare(pass, user.password);
    if (isPasswordMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  login(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const payload = { username: user._doc.email, sub: user._doc._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async googleLogin(idToken: string) {
    const client = new OAuth2Client();

    let ticket: LoginTicket;
    try {
      ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: this.configService.get<string>("GOOGLE_OAUTH_WEB_CLIENT_ID"),
      });
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error("Error verifying Google ID token:", errorStack);
      throw new UnauthorizedException("Invalid Google ID token");
    }

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException("Invalid Google ID token");
    }

    if (!payload.email) {
      throw new UnauthorizedException("Google token missing email");
    }

    const user = await this.usersService.createGoogleUser({
      email: payload.email,
      displayName: payload.name || payload.email.split("@")[0],
      avatarUrl: payload.picture,
      providers: [
        {
          provider: "google",
          providerId: payload.sub,
          linkedAt: dayjs().utc().toDate(),
        },
      ],
    });

    const jwtPayload = { username: user.email, sub: user._id };
    return {
      accessToken: this.jwtService.sign(jwtPayload),
    };
  }
}
