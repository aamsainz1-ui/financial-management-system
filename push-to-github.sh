#!/bin/bash

###############################################################################
# Script สำหรับ Push โปรเจคไปยัง GitHub Repository
# Repository: https://github.com/aamsainz1-ui/Final-study-2
###############################################################################

set -e  # Exit on error

# สี ANSI สำหรับ output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 Push Financial Management System to GitHub           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ตรวจสอบว่าอยู่ใน git repository
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: ไม่ใช่ git repository${NC}"
    exit 1
fi

# ตรวจสอบว่ามี remote final-study หรือไม่
if ! git remote | grep -q "^final-study$"; then
    echo -e "${YELLOW}⚠️  ไม่พบ remote 'final-study' กำลังเพิ่ม...${NC}"
    git remote add final-study https://github.com/aamsainz1-ui/Final-study-2.git
    echo -e "${GREEN}✅ เพิ่ม remote 'final-study' เรียบร้อย${NC}"
fi

echo ""
echo -e "${BLUE}📊 ข้อมูลโปรเจค:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# แสดงข้อมูล remote
echo -e "${BLUE}Remote repositories:${NC}"
git remote -v

echo ""
echo -e "${BLUE}Current branch:${NC}"
git branch --show-current

echo ""
echo -e "${BLUE}Recent commits:${NC}"
git log --oneline -5

echo ""
echo -e "${BLUE}Files in repository:${NC}"
git ls-files | wc -l | xargs echo "Total files:"

echo ""
echo -e "${BLUE}Repository size:${NC}"
du -sh .git/ | awk '{print $1}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ถามผู้ใช้ว่าต้องการ push หรือไม่
echo ""
echo -e "${YELLOW}⚠️  คุณต้องการ push ไปยัง repository Final-study-2 หรือไม่?${NC}"
echo ""
echo "Repository: https://github.com/aamsainz1-ui/Final-study-2"
echo ""
echo "จะ push ทั้งหมด:"
echo "  1. main branch"
echo "  2. claude/test-validation-011CURtosU7Ri66kJHSLXT5w branch"
echo "  3. All commits (4 commits)"
echo ""

read -p "กด Enter เพื่อดำเนินการต่อ หรือ Ctrl+C เพื่อยกเลิก..."

echo ""
echo -e "${BLUE}🚀 เริ่มการ push...${NC}"
echo ""

# Push main branch
echo -e "${BLUE}📤 Pushing main branch...${NC}"
if git push final-study main:main; then
    echo -e "${GREEN}✅ Push main branch สำเร็จ${NC}"
else
    echo -e "${RED}❌ Push main branch ล้มเหลว${NC}"
    echo -e "${YELLOW}💡 Hint: ตรวจสอบ GitHub authentication${NC}"
    echo ""
    echo "วิธีแก้ไข:"
    echo "1. ใช้ Personal Access Token:"
    echo "   git remote set-url final-study https://<TOKEN>@github.com/aamsainz1-ui/Final-study-2.git"
    echo ""
    echo "2. ใช้ SSH:"
    echo "   git remote set-url final-study git@github.com:aamsainz1-ui/Final-study-2.git"
    exit 1
fi

echo ""

# Push feature branch
echo -e "${BLUE}📤 Pushing feature branch...${NC}"
if git push -u final-study claude/test-validation-011CURtosU7Ri66kJHSLXT5w; then
    echo -e "${GREEN}✅ Push feature branch สำเร็จ${NC}"
else
    echo -e "${YELLOW}⚠️  Push feature branch ล้มเหลว (อาจ skip ได้)${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ Push สำเร็จแล้ว!                         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🌐 ดู repository ได้ที่:${NC}"
echo "   https://github.com/aamsainz1-ui/Final-study-2"
echo ""

echo -e "${BLUE}📚 Documentation ที่ push ไป:${NC}"
echo "   ✓ README.md - คู่มือโปรเจค"
echo "   ✓ VALIDATION_REPORT.md - รายงานการทดสอบ"
echo "   ✓ CLEANUP_SUMMARY.md - สรุปการจัดการไฟล์"
echo "   ✓ DEPLOYMENT.md - คู่มือ deployment"
echo "   ✓ GITHUB_UPLOAD_INSTRUCTIONS.md - คู่มือการอัพโหลด"
echo ""

echo -e "${BLUE}🎯 ขั้นตอนต่อไป:${NC}"
echo "   1. ตรวจสอบ repository บน GitHub"
echo "   2. สร้าง Pull Request (ถ้าต้องการ)"
echo "   3. Deploy to production"
echo ""

echo -e "${GREEN}🎉 เสร็จสิ้น!${NC}"
