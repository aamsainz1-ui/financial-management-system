#!/bin/bash

# Script to test adding multiple customer records
BASE_URL="http://localhost:3000"

echo "👥 Starting bulk customer test..."

# Get available teams
echo "📋 Getting available teams..."
TEAMS=$(curl -s "$BASE_URL/api/teams" | jq -r '.[].id')
TEAM_ARRAY=($TEAMS)
echo "Found ${#TEAM_ARRAY[@]} teams"

# Add 25 customer records
for i in {1..25}; do
  TEAM_ID=${TEAM_ARRAY[$((i % ${#TEAM_ARRAY[@]}))]}
  DAY=$((i % 28 + 1))
  
  curl -X POST "$BASE_URL/api/customer-counts" \
    -H "Content-Type: application/json" \
    -d "{
      \"date\": \"2025-01-$DAY\",
      \"newCustomers\": $((5 + i % 20)),
      \"depositCustomers\": $((3 + i % 15)),
      \"totalCustomers\": $((100 + i * 10)),
      \"teamId\": \"$TEAM_ID\",
      \"notes\": \"บันทึกลูกค้าวันที่ $DAY\"
    }" > /dev/null 2>&1
  
  echo "👤 Added customer record $i/25"
  sleep 0.1
done

echo "🎉 Bulk customer test completed!"
echo "📊 Checking total customer records..."

curl -s "$BASE_URL/api/customer-counts" | jq 'length'