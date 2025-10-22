#!/bin/bash

# Script to test adding multiple teams and members
BASE_URL="http://localhost:3000"

echo "🏢 Starting bulk teams and members test..."

# Add 5 new teams
for i in {1..5}; do
  curl -X POST "$BASE_URL/api/teams" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"ทีมทดสอบ $i\",
      \"description\": \"คำอธิบายทีมทดสอบ $i\"
    }" > /dev/null 2>&1
  
  echo "🏢 Added team $i/5"
  sleep 0.1
done

# Get all teams including new ones
echo "📋 Getting all teams..."
TEAMS=$(curl -s "$BASE_URL/api/teams" | jq -r '.[].id')
TEAM_ARRAY=($TEAMS)
echo "Found ${#TEAM_ARRAY[@]} teams total"

# Add 15 new members
for i in {1..15}; do
  TEAM_ID=${TEAM_ARRAY[$((i % ${#TEAM_ARRAY[@]}))]}
  
  curl -X POST "$BASE_URL/api/members" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"สมาชิกทดสอบ $i\",
      \"email\": \"member$i@test.com\",
      \"position\": \"ตำแหน่งทดสอบ $i\",
      \"teamId\": \"$TEAM_ID\"
    }" > /dev/null 2>&1
  
  echo "👤 Added member $i/15"
  sleep 0.1
done

echo "🎉 Bulk teams and members test completed!"
echo "📊 Checking totals..."

echo "Teams: $(curl -s "$BASE_URL/api/teams" | jq 'length')"
echo "Members: $(curl -s "$BASE_URL/api/members" | jq 'length')"