#!/bin/bash

# Script to test adding multiple payroll records
BASE_URL="http://localhost:3000"

echo "💰 Starting bulk payroll test..."

# Get available members
echo "📋 Getting available members..."
MEMBERS=$(curl -s "$BASE_URL/api/members" | jq -r '.[].id')
MEMBER_ARRAY=($MEMBERS)
echo "Found ${#MEMBER_ARRAY[@]} members"

# Add 15 salary records
for i in {1..15}; do
  MEMBER_ID=${MEMBER_ARRAY[$((i % ${#MEMBER_ARRAY[@]}))]}
  MONTH=$((i % 12 + 1))
  
  curl -X POST "$BASE_URL/api/salaries" \
    -H "Content-Type: application/json" \
    -d "{
      \"memberId\": \"$MEMBER_ID\",
      \"amount\": $((25000 + i * 1000)),
      \"payDate\": \"2025-$((i % 12 + 1))-25\",
      \"month\": $MONTH,
      \"year\": 2025,
      \"description\": \"เงินเดือนเดือน $MONTH ปี 2025\"
    }" > /dev/null 2>&1
  
  echo "💵 Added salary record $i/15"
  sleep 0.1
done

# Add 15 bonus records
for i in {1..15}; do
  MEMBER_ID=${MEMBER_ARRAY[$((i % ${#MEMBER_ARRAY[@]}))]}
  
  curl -X POST "$BASE_URL/api/bonuses" \
    -H "Content-Type: application/json" \
    -d "{
      \"memberId\": \"$MEMBER_ID\",
      \"amount\": $((2000 + i * 500)),
      \"reason\": \"โบนัสพิเศษครั้งที่ $i\",
      \"date\": \"2025-$((i % 12 + 1))-15\"
    }" > /dev/null 2>&1
  
  echo "🎁 Added bonus record $i/15"
  sleep 0.1
done

# Add 15 commission records
for i in {1..15}; do
  MEMBER_ID=${MEMBER_ARRAY[$((i % ${#MEMBER_ARRAY[@]}))]}
  SALES_AMOUNT=$((50000 + i * 10000))
  COMMISSION_AMOUNT=$((SALES_AMOUNT * 5 / 100))
  
  curl -X POST "$BASE_URL/api/commissions" \
    -H "Content-Type: application/json" \
    -d "{
      \"memberId\": \"$MEMBER_ID\",
      \"amount\": $COMMISSION_AMOUNT,
      \"percentage\": 5,
      \"salesAmount\": $SALES_AMOUNT,
      \"description\": \"ค่าคอมมิชชันจากยอดขาย $SALES_AMOUNT บาท\",
      \"date\": \"2025-$((i % 12 + 1))-28\"
    }" > /dev/null 2>&1
  
  echo "📈 Added commission record $i/15"
  sleep 0.1
done

echo "🎉 Bulk payroll test completed!"
echo "📊 Checking totals..."

echo "Salaries: $(curl -s "$BASE_URL/api/salaries" | jq 'length')"
echo "Bonuses: $(curl -s "$BASE_URL/api/bonuses" | jq 'length')"
echo "Commissions: $(curl -s "$BASE_URL/api/commissions" | jq 'length')"