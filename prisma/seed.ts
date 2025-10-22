import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create teams
  let marketingTeam = await prisma.team.findFirst({ where: { name: 'ทีมการตลาด' } })
  if (!marketingTeam) {
    marketingTeam = await prisma.team.create({
      data: {
        name: 'ทีมการตลาด',
        description: 'ทีมรับผิดชอบด้านการตลาด',
        leader: 'คุณมาร์ค',
        budget: 50000,
        color: 'blue'
      }
    })
  }

  let salesTeam = await prisma.team.findFirst({ where: { name: 'ทีมขาย' } })
  if (!salesTeam) {
    salesTeam = await prisma.team.create({
      data: {
        name: 'ทีมขาย',
        description: 'ทีมรับผิดชอบด้านการขาย',
        leader: 'คุณเจน',
        budget: 75000,
        color: 'green'
      }
    })
  }

  let serviceTeam = await prisma.team.findFirst({ where: { name: 'ทีมบริการลูกค้า' } })
  if (!serviceTeam) {
    serviceTeam = await prisma.team.create({
      data: {
        name: 'ทีมบริการลูกค้า',
        description: 'ทีมรับผิดชอบด้านการบริการลูกค้า',
        leader: 'คุณบ๊อบ',
        budget: 30000,
        color: 'purple'
      }
    })
  }

  // Create categories
  const incomeCategories = [
    { name: 'ค่าบริการ', icon: '💰', type: 'income' },
    { name: 'ค่าสินค้า', icon: '📦', type: 'income' },
    { name: 'ค่าธรรมเนียม', icon: '📋', type: 'income' },
    { name: 'ดอกเบี้ย', icon: '📈', type: 'income' }
  ]

  const expenseCategories = [
    { name: 'ค่าเช่า', icon: '🏢', type: 'expense' },
    { name: 'ค่าจ้าง', icon: '💼', type: 'expense' },
    { name: 'ค่าโฆษณา', icon: '📢', type: 'expense' },
    { name: 'ค่าใช้จ่ายอื่นๆ', icon: '📝', type: 'expense' },
    { name: 'ค่าสาธารณูปโภค', icon: '💡', type: 'expense' },
    { name: 'ค่าอินเทอร์เน็ต', icon: '🌐', type: 'expense' }
  ]

  for (const cat of incomeCategories) {
    const existingCategory = await prisma.category.findFirst({ where: { name: cat.name } })
    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: cat.name,
          description: `หมวดหมู่${cat.name}`,
          type: cat.type,
          budget: 100000,
          icon: cat.icon,
          color: 'green'
        }
      })
    }
  }

  for (const cat of expenseCategories) {
    const existingCategory = await prisma.category.findFirst({ where: { name: cat.name } })
    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: cat.name,
          description: `หมวดหมู่${cat.name}`,
          type: cat.type,
          budget: 50000,
          icon: cat.icon,
          color: 'red'
        }
      })
    }
  }

  // Get all categories
  const categories = await prisma.category.findMany()
  const incomeCategoryIds = categories.filter(c => c.type === 'income').map(c => c.id)
  const expenseCategoryIds = categories.filter(c => c.type === 'expense').map(c => c.id)

  // Create sample transactions
  const sampleTransactions = [
    {
      title: 'ค่าบริการลูกค้าเดือนมกราคม',
      description: 'รับจากลูกค้ารายเดือน',
      amount: 15000,
      type: 'income',
      categoryId: incomeCategoryIds[0],
      teamId: salesTeam.id,
      date: new Date('2024-01-15')
    },
    {
      title: 'ขายสินค้าชุดที่ 1',
      description: 'ขายสินค้าให้ลูกค้าใหม่',
      amount: 8500,
      type: 'income',
      categoryId: incomeCategoryIds[1],
      teamId: salesTeam.id,
      date: new Date('2024-01-20')
    },
    {
      title: 'ค่าธรรมเนียมการโอนเงิน',
      description: 'ค่าธรรมเนียมจากการทำธุรกรรม',
      amount: 500,
      type: 'income',
      categoryId: incomeCategoryIds[2],
      teamId: serviceTeam.id,
      date: new Date('2024-01-25')
    },
    {
      title: 'ค่าเช่าสำนักงานเดือนมกราคม',
      description: 'ค่าเช่าสำนักงานเดือนมกราคม 2024',
      amount: 12000,
      type: 'expense',
      categoryId: expenseCategoryIds[0],
      teamId: marketingTeam.id,
      date: new Date('2024-01-01')
    },
    {
      title: 'ค่าจ้างพนักงาน',
      description: 'เงินเดือนพนักงานเดือนมกราคม',
      amount: 25000,
      type: 'expense',
      categoryId: expenseCategoryIds[1],
      teamId: serviceTeam.id,
      date: new Date('2024-01-05')
    },
    {
      title: 'ค่าโฆษณา Facebook',
      description: 'โฆษณาบน Facebook เดือนมกราคม',
      amount: 3500,
      type: 'expense',
      categoryId: expenseCategoryIds[2],
      teamId: marketingTeam.id,
      date: new Date('2024-01-10')
    },
    {
      title: 'ค่าไฟฟ้า',
      description: 'ค่าไฟฟ้าเดือนมกราคม',
      amount: 1200,
      type: 'expense',
      categoryId: expenseCategoryIds[4],
      teamId: marketingTeam.id,
      date: new Date('2024-01-08')
    },
    {
      title: 'ค่าอินเทอร์เน็ต',
      description: 'ค่าอินเทอร์เน็ตเดือนมกราคม',
      amount: 800,
      type: 'expense',
      categoryId: expenseCategoryIds[5],
      teamId: serviceTeam.id,
      date: new Date('2024-01-08')
    },
    {
      title: 'ค่าบริการลูกค้าเดือนกุมภาพันธ์',
      description: 'รับจากลูกค้ารายเดือน',
      amount: 18000,
      type: 'income',
      categoryId: incomeCategoryIds[0],
      teamId: salesTeam.id,
      date: new Date('2024-02-15')
    },
    {
      title: 'ขายสินค้าชุดที่ 2',
      description: 'ขายสินค้าให้ลูกค้าใหม่',
      amount: 12000,
      type: 'income',
      categoryId: incomeCategoryIds[1],
      teamId: salesTeam.id,
      date: new Date('2024-02-20')
    }
  ]

  for (const transaction of sampleTransactions) {
    await prisma.transaction.create({
      data: transaction
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })