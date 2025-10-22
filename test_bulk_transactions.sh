#!/bin/bash

# Script to test adding multiple transactions
BASE_URL="http://localhost:3000"

echo "🚀 Starting bulk transaction test..."

# Add 20 income transactions
for i in {1..20}; do
  curl -X POST "$BASE_URL/api/transactions" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"รายได้จากการขายสินค้า $i\",
      \"description\": \"ขายสินค้าชนิด $i จำนวน $((i * 10)) ชิ้น\",
      \"amount\": $((i * 2500 + 10000)),
      \"type\": \"income\",
      \"categoryId\": \"cmgug61yf001bmh3vaxoinqyi\",
      \"date\": \"2025-01-$((i % 28 + 1))\",
      \"bankName\": \"ธนาคารทดสอบ\",
      \"bankAccount\": \"123456789$i\",
      \"accountName\": \"บริษัท ทดสอบ $i\"
    }" > /dev/null 2>&1
  
  echo "✅ Added income transaction $i/20"
  sleep 0.1
done

# Add 20 expense transactions
for i in {1..20}; do
  curl -X POST "$BASE_URL/api/transactions" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"ค่าใช้จ่ายประเภท $i\",
      \"description\": \"รายละเอียดค่าใช้จ่าย $i\",
      \"amount\": $((i * 1500 + 5000)),
      \"type\": \"expense\",
      \"categoryId\": \"cmgug61m60017mh3vzk1f28vr\",
      \"date\": \"2025-01-$((i % 28 + 1))\"
    }" > /dev/null 2>&1
  
  echo "💸 Added expense transaction $i/20"
  sleep 0.1
done

echo "🎉 Bulk transaction test completed!"
echo "📊 Checking total transactions..."

curl -s "$BASE_URL/api/transactions" | jq 'length'