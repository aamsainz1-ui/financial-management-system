/**
 * ฟังก์ชันจัดการเวลาของประเทศไทย
 * Thailand Time Utilities
 */

// ฟังก์ชันดึงเวลาปัจจุบันของประเทศไทย (UTC+7)
export function getThaiTimeString(): string {
  const now = new Date()
  return now.toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// ฟังก์ชันดึงวันที่ปัจจุบันของประเทศไทย (YYYY-MM-DD)
export function getThaiDateString(): string {
  const now = new Date()
  const thaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
  return thaiTime.toISOString().split('T')[0]
}

// ฟังก์ชันตรวจสอบว่าเป็นช่วงเช้า (06:00-12:00) ตามเวลาประเทศไทยหรือไม่
export function isMorningTime(): boolean {
  const now = new Date()
  const thaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
  const hour = thaiTime.getHours()
  return hour >= 6 && hour < 12
}

// ฟังก์ชันตรวจสอบว่าควรโหลดข้อมูลของวันก่อนหน้าหรือไม่ (ช่วงเช้า)
export function shouldLoadPreviousDayData(): boolean {
  return isMorningTime()
}

// ฟังก์ชันดึงวันที่ที่ควรแสดงข้อมูล (ตอนนี้ใช้วันที่ปัจจุบันเสมอ)
export function getDisplayDate(): string {
  return getCurrentThaiDate()
}

// ฟังก์ชันดึงวันที่ปัจจุบันของประเทศไทย (ไม่พิจารณาช่วงเช้า)
export function getCurrentThaiDate(): string {
  const now = new Date()
  const thaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
  return thaiTime.toISOString().split('T')[0]
}

// ฟังก์ชันดึงวันที่ของวันก่อนหน้าตามเวลาประเทศไทย
export function getPreviousThaiDate(): string {
  const now = new Date()
  const thaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
  const yesterday = new Date(thaiTime)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// ฟังก์ชันแสดงวันที่ในรูปแบบไทย (สำหรับแสดงผล)
export function formatThaiDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ฟังก์ชันแสดงวันที่และเวลาในรูปแบบไทย (สำหรับแสดงผล)
export function formatThaiDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}