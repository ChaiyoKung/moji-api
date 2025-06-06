# API

## MongoDB Collections Schema

### 1. users

```ts
{
  _id: ObjectId,
  email: String,                   // อีเมล (unique)
  displayName: String,             // ชื่อที่แสดง
  avatarUrl: String,               // ลิงก์รูปโปรไฟล์ (optional)
  providers: [                     // รายการ OAuth2 providers ที่เชื่อมต่อ
    {
      provider: String,            // เช่น "google", "facebook"
      providerId: String,          // user id จาก provider นั้น
      linkedAt: Date               // วันที่เชื่อมต่อ provider นี้
    }
  ],
  createdAt: Date,                 // วันที่สมัคร
  updatedAt: Date,                 // วันที่แก้ไขล่าสุด
  settings: {                      // การตั้งค่าส่วนตัว (optional)
    currency: String,              // สกุลเงินหลัก เช่น "THB"
    language: String               // ภาษา เช่น "th"
  }
}
```

### 2. accounts

```ts
{
  _id: ObjectId,
  userId: ObjectId,            // อ้างอิงไปยัง users._id
  name: String,                // ชื่อบัญชี เช่น "กระเป๋าสตางค์", "บัญชีธนาคาร"
  type: String,                // ประเภทบัญชี เช่น "cash", "bank", "credit"
  balance: Number,             // ยอดเงินปัจจุบัน (optional, สำหรับแสดงผล)
  currency: String,            // สกุลเงิน เช่น "THB"
  icon: String,                // ไอคอนหรือสัญลักษณ์บัญชี (optional)
  createdAt: Date,             // วันที่สร้างบัญชี
  updatedAt: Date              // วันที่แก้ไขล่าสุด
}
```

### 3. categories

```ts
{
  _id: ObjectId,
  userId: ObjectId,            // อ้างอิงไปยัง users._id (null ถ้าเป็น global category)
  name: String,                // ชื่อหมวดหมู่ เช่น "อาหาร", "เดินทาง"
  type: String,                // "income" หรือ "expense"
  icon: String,                // ไอคอนหมวดหมู่ (optional)
  color: String,               // สีประจำหมวดหมู่ (optional)
  parentId: ObjectId,          // อ้างอิงหมวดหมู่หลัก (optional, สำหรับหมวดหมู่ย่อย)
  createdAt: Date,             // วันที่สร้าง
  updatedAt: Date              // วันที่แก้ไขล่าสุด
}
```

### 4. transactions

```ts
{
  _id: ObjectId,
  userId: ObjectId,            // อ้างอิงไปยัง users._id
  accountId: ObjectId,         // อ้างอิงไปยัง accounts._id
  categoryId: ObjectId,        // อ้างอิงไปยัง categories._id
  type: String,                // "income" หรือ "expense"
  amount: Number,              // จำนวนเงิน
  currency: String,            // สกุลเงิน เช่น "THB"
  note: String,                // หมายเหตุ (optional)
  date: Date,                  // วันที่ทำรายการ
  createdAt: Date,             // วันที่สร้างรายการ
  updatedAt: Date              // วันที่แก้ไขล่าสุด
}
```
