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

  async logout(refreshToken: string) {
    try {
      // Verify and decode refresh token to get userId
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
      const userId = payload.sub;

      // Find user by id
      const user = await this.usersService.findOne({ _id: userId });
      if (!user || !user.refreshTokens?.includes(refreshToken)) {
        this.logger.warn(
          `Logout: Refresh token for user ${userId} is invalid or not found`
        );
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Remove the refresh token
      await this.usersService.removeRefreshTokenById(userId, refreshToken);

      return { message: "Logged out successfully" };
    } catch (error) {
      this.logger.error("Error during logout:", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      // Find user by id from token payload
      const user = await this.usersService.findOne({ _id: payload.sub });
      if (!user || !user.refreshTokens?.includes(refreshToken)) {
        this.logger.warn(
          `Refresh token for user ${payload.sub} is invalid or not found`
        );
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Remove the used refresh token
      await this.usersService.removeRefreshTokenById(
        user._id.toString(),
        refreshToken
      );

      // Issue new access token
      const accessToken = this.jwtService.sign({
        username: user.email,
        sub: user._id,
        type: "access",
      });

      // Issue new refresh token
      const newRefreshToken = this.jwtService.sign(
        { username: user.email, sub: user._id, type: "refresh" },
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.get<string>(
            "JWT_REFRESH_EXPIRES_IN",
            "7d"
          ),
        }
      );

      // Save new refresh token
      await this.usersService.updateRefreshTokenById(
        user._id.toString(),
        newRefreshToken
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error("Error refreshing access token:", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

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

  async login(user: { _doc: { email: string; _id: string } }) {
    const accessToken = this.jwtService.sign({
      username: user._doc.email,
      sub: user._doc._id,
      type: "access",
    });

    const refreshToken = this.jwtService.sign(
      { username: user._doc.email, sub: user._doc._id, type: "refresh" },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>(
          "JWT_REFRESH_EXPIRES_IN",
          "7d"
        ),
      }
    );

    await this.usersService.updateRefreshTokenById(
      user._doc._id.toString(),
      refreshToken
    );

    return {
      user: user._doc,
      accessToken,
      refreshToken,
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

    const accessToken = this.jwtService.sign({
      username: user.email,
      sub: user._id,
      type: "access",
    });

    const refreshToken = this.jwtService.sign(
      { username: user.email, sub: user._id, type: "refresh" },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>(
          "JWT_REFRESH_EXPIRES_IN",
          "7d"
        ),
      }
    );

    await this.usersService.updateRefreshTokenById(
      user._id.toString(),
      refreshToken
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
