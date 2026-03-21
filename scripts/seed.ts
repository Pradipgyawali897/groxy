import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import slugify from 'slugify'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type UserRole = 'customer' | 'merchant'

const CATEGORY_NAMES = [
  'Fiction', 'Fantasy', 'Science', 'Biography', 'Self Help',
  'History', 'Romance', 'Mystery', 'Business', 'Technology'
]

const BOOK_TITLES = [
  'Silent Pages', 'The Last Library', 'Atomic Focus', 'Mind of Tomorrow',
  'Beyond the Horizon', 'Golden Ink', 'The Reading Room', 'Paper Dreams',
  'Sapiens Echo', 'Deep Work Notes', 'Hidden Chapters', 'The Story Merchant'
]

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true })
}

async function createAuthUser(email: string, password: string, meta: Record<string, any>) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  })

  if (error) {
    // If user already exists, fetch by email
    const { data: list, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError
    const existing = list.users.find((u) => u.email === email)
    if (!existing) throw error
    return existing
  }

  return data.user
}

async function upsertProfile(userId: string, email: string, role: UserRole) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: faker.person.fullName(),
    avatar_url: faker.image.avatar(),
    role,
    is_onboarded: true,
    onboarding_step: 4,
  })

  if (error) throw error
}

async function ensureCustomerPreferences(userId: string) {
  const genres = faker.helpers.arrayElements(CATEGORY_NAMES, 3)
  const interests = faker.helpers.arrayElements(
    ['Bestsellers', 'New Releases', 'Classics', 'Award Winners', 'Indie Books'],
    3
  )

  const { error } = await supabase.from('customer_preferences').upsert({
    user_id: userId,
    favorite_genres: genres,
    reading_interests: interests,
    newsletter_opt_in: true,
  })

  if (error) throw error
}

async function ensureMerchantWorkspace(userId: string, email: string, storeName: string) {
  const { error } = await supabase.from('merchant_workspaces').upsert({
    user_id: userId,
    store_name: storeName,
    store_slug: toSlug(storeName),
    description: faker.company.catchPhrase(),
    logo_url: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
    banner_url: faker.image.urlPicsumPhotos({ width: 1200, height: 400 }),
    support_email: email,
    approved: true,
  })

  if (error) throw error
}

async function seedCategories() {
  const rows = CATEGORY_NAMES.map((name) => ({
    name,
    slug: toSlug(name),
    description: `${name} books`,
  }))

  const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'slug' })
  if (error) throw error

  const { data, error: fetchError } = await supabase.from('categories').select('*')
  if (fetchError) throw fetchError
  return data
}

async function seedAuthors(count = 15) {
  const rows = Array.from({ length: count }).map(() => {
    const name = faker.person.fullName()
    return {
      name,
      slug: toSlug(name + '-' + faker.string.alphanumeric(4)),
      bio: faker.lorem.paragraph(),
      avatar_url: faker.image.avatar(),
    }
  })

  const { error } = await supabase.from('authors').insert(rows)
  if (error) throw error

  const { data, error: fetchError } = await supabase.from('authors').select('*')
  if (fetchError) throw fetchError
  return data
}

async function createMerchantBook(merchantId: string, sellerEmail: string, i: number) {
  const title = `${faker.helpers.arrayElement(BOOK_TITLES)} ${i + 1}`
  const slug = toSlug(title + '-' + faker.string.alphanumeric(5))
  const genre = faker.helpers.arrayElement(CATEGORY_NAMES)
  const price = Number(faker.commerce.price({ min: 8, max: 80 }))
  const originalPrice = Number((price + faker.number.float({ min: 2, max: 20, fractionDigits: 2 })).toFixed(2))

  const { data, error } = await supabase
    .from('books')
    .insert({
      merchant_id: merchantId,
      seller_email: sellerEmail,
      title,
      slug,
      subtitle: faker.datatype.boolean() ? faker.company.catchPhrase() : null,
      description: faker.lorem.paragraphs(2),
      genre,
      book_condition: faker.helpers.arrayElement(['new', 'like new', 'good', 'fair']),
      isbn: faker.string.numeric(13),
      language: 'English',
      price,
      original_price: originalPrice,
      stock: faker.number.int({ min: 1, max: 40 }),
      cover_image_url: faker.image.urlPicsumPhotos({ width: 600, height: 900 }),
      gallery_urls: [
        faker.image.urlPicsumPhotos({ width: 600, height: 900 }),
        faker.image.urlPicsumPhotos({ width: 600, height: 900 }),
      ],
      status: 'published',
      is_featured: faker.datatype.boolean({ probability: 0.2 }),
      average_rating: Number(faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 })),
      rating_count: faker.number.int({ min: 0, max: 250 }),
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function seedBooks(merchantId: string, sellerEmail: string, categories: any[], authors: any[], count = 24) {
  const bookIds: string[] = []

  for (let i = 0; i < count; i++) {
    const book = await createMerchantBook(merchantId, sellerEmail, i)
    bookIds.push(book.id)

    const chosenCategories = faker.helpers.arrayElements(categories, faker.number.int({ min: 1, max: 3 }))
    const chosenAuthors = faker.helpers.arrayElements(authors, faker.number.int({ min: 1, max: 2 }))

    const bookCategoryRows = chosenCategories.map((c) => ({
      book_id: book.id,
      category_id: c.id,
    }))

    const bookAuthorRows = chosenAuthors.map((a) => ({
      book_id: book.id,
      author_id: a.id,
    }))

    const imageRows = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map((_, idx) => ({
      book_id: book.id,
      image_url: faker.image.urlPicsumPhotos({ width: 600, height: 900 }),
      alt_text: `${book.title} image ${idx + 1}`,
      position: idx,
    }))

    const { error: bcError } = await supabase.from('book_categories').insert(bookCategoryRows)
    if (bcError) throw bcError

    const { error: baError } = await supabase.from('book_authors').insert(bookAuthorRows)
    if (baError) throw baError

    const { error: biError } = await supabase.from('book_images').insert(imageRows)
    if (biError) throw biError
  }

  return bookIds
}

async function ensureCartAndWishlist(userId: string) {
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single()
  if (cartError) throw cartError

  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single()
  if (wishlistError) throw wishlistError

  return { cart, wishlist }
}

async function seedAddress(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      label: 'Home',
      recipient_name: faker.person.fullName(),
      line_1: faker.location.streetAddress(),
      line_2: faker.datatype.boolean() ? faker.location.secondaryAddress() : null,
      city: faker.location.city(),
      state: faker.location.state(),
      postal_code: faker.location.zipCode(),
      country: faker.location.country(),
      phone: faker.phone.number(),
      address_type: 'shipping',
      is_default: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function seedCartItems(cartId: string, bookIds: string[]) {
  const selectedBookIds = faker.helpers.arrayElements(bookIds, Math.min(4, bookIds.length))

  for (const bookId of selectedBookIds) {
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('id, price')
      .eq('id', bookId)
      .single()
    if (fetchError) throw fetchError

    const { error } = await supabase.from('cart_items').upsert(
      {
        cart_id: cartId,
        book_id: book.id,
        quantity: faker.number.int({ min: 1, max: 3 }),
        unit_price: book.price,
      },
      { onConflict: 'cart_id,book_id' }
    )
    if (error) throw error
  }
}

async function seedWishlistItems(wishlistId: string, bookIds: string[]) {
  const selectedBookIds = faker.helpers.arrayElements(bookIds, Math.min(5, bookIds.length))

  for (const bookId of selectedBookIds) {
    const { error } = await supabase.from('wishlist_items').upsert(
      {
        wishlist_id: wishlistId,
        book_id: bookId,
      },
      { onConflict: 'wishlist_id,book_id' }
    )
    if (error) throw error
  }
}

async function seedOrder(customerId: string, merchantId: string, addressId: string, bookIds: string[]) {
  const selectedBookIds = faker.helpers.arrayElements(bookIds, 2)
  let subtotal = 0
  const items: any[] = []

  for (const bookId of selectedBookIds) {
    const { data: book, error } = await supabase
      .from('books')
      .select('id, title, price')
      .eq('id', bookId)
      .single()
    if (error) throw error

    const quantity = faker.number.int({ min: 1, max: 2 })
    subtotal += Number(book.price) * quantity

    items.push({
      book_id: book.id,
      title_snapshot: book.title,
      author_snapshot: faker.person.fullName(),
      quantity,
      unit_price: book.price,
    })
  }

  const shipping_total = 5
  const tax_total = Number((subtotal * 0.08).toFixed(2))
  const total = Number((subtotal + shipping_total + tax_total).toFixed(2))

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: customerId,
      merchant_id: merchantId,
      address_id: addressId,
      status: 'paid',
      payment_status: 'paid',
      subtotal,
      shipping_total,
      tax_total,
      total,
      placed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError) throw orderError

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      ...item,
    }))
  )
  if (itemsError) throw itemsError

  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: order.id,
    provider: 'stripe',
    provider_payment_id: faker.string.alphanumeric(16),
    amount: total,
    status: 'paid',
    metadata: { seeded: true },
  })
  if (paymentError) throw paymentError

  return order
}

async function seedReviews(customerId: string, bookIds: string[]) {
  const selectedBookIds = faker.helpers.arrayElements(bookIds, Math.min(6, bookIds.length))

  for (const bookId of selectedBookIds) {
    const { error } = await supabase.from('reviews').upsert(
      {
        user_id: customerId,
        book_id: bookId,
        rating: faker.number.int({ min: 3, max: 5 }),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        status: 'published',
      },
      { onConflict: 'user_id,book_id' }
    )
    if (error) throw error
  }
}

async function main() {
  console.log('Seeding started...')

  // Create merchant
  const merchantEmail = 'merchant@example.com'
  const merchantPassword = 'Password123!'
  const merchantUser = await createAuthUser(merchantEmail, merchantPassword, {
    full_name: 'Merchant Owner',
  })
  await upsertProfile(merchantUser.id, merchantEmail, 'merchant')
  await ensureMerchantWorkspace(merchantUser.id, merchantEmail, 'Moonlight Books')

  // Create customer
  const customerEmail = 'customer@example.com'
  const customerPassword = 'Password123!'
  const customerUser = await createAuthUser(customerEmail, customerPassword, {
    full_name: 'Customer Reader',
  })
  await upsertProfile(customerUser.id, customerEmail, 'customer')
  await ensureCustomerPreferences(customerUser.id)

  const categories = await seedCategories()
  const authors = await seedAuthors(18)
  const bookIds = await seedBooks(merchantUser.id, merchantEmail, categories, authors, 30)

  const { cart, wishlist } = await ensureCartAndWishlist(customerUser.id)
  const address = await seedAddress(customerUser.id)

  await seedCartItems(cart.id, bookIds)
  await seedWishlistItems(wishlist.id, bookIds)
  await seedOrder(customerUser.id, merchantUser.id, address.id, bookIds)
  await seedReviews(customerUser.id, bookIds)

  console.log('Seeding completed successfully.')
  console.log({
    merchantEmail,
    merchantPassword,
    customerEmail,
    customerPassword,
  })
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})