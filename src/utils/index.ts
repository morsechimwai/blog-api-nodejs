// Utility function to generate a random username
// ฟังก์ชันช่วยในการสร้างชื่อผู้ใช้แบบสุ่ม
export const genUsername = (): string => {
	const usernamePrefix = 'user-'; // Prefix for the username
	const randomChars = Math.random().toString(36).slice(2); // Generate random alphanumeric characters
	const username = usernamePrefix + randomChars; // Combine prefix and random characters to form the username
	return username;
};

/**
 * Generate a random slug from a title (e.g. my-title-abc123)
 * @param title - The title to generate the slug from
 * @returns A URL-friendly slug
 * */
export const generateSlug = (title: string): string => {
	const slug = title
		.toLowerCase() // แปลงเป็นตัวพิมพ์เล็ก
		.trim() // ตัดช่องว่างที่ส่วนต้นและส่วนท้ายออก
		.replace(/[^a-z0-9]\s=/g, '') // ลบอักขระพิเศษ
		.replace(/\s+/g, '-') // แทนที่ช่องว่างด้วยขีดกลาง
		.replace(/-+/g, '-'); // แทนที่ขีดกลางที่ซ้ำกันด้วยขีดกลางเดียว

	const randomChars = Math.random().toString(36).slice(2); // สร้างอักขระสุ่ม
	const uniqueSlug = `${slug}-${randomChars}`; // รวม slug กับอักขระสุ่มเพื่อให้แน่ใจว่าไม่ซ้ำกัน

	return uniqueSlug;
};
