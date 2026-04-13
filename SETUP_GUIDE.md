# HomeStyle E-Commerce Website - Setup & Customization Guide

## 🚀 Quick Start Guide

### Step 1: Set Up Your Domain
1. Copy replace `yourwebsite.com` with your actual domain in:
   - `robots.txt` - Line 14
   - `sitemap.xml` - Replace all occurrences
   - HTML files - Canonical links (optional)

### Step 2: Customize Content

#### Update Business Information
Edit these files to add your business details:

**Contact Page (`contact.html`):**
- Business address
- Phone number
- Email addresses
- Business hours

**Footer (all pages):**
- Company name and description
- Social media links
- Quick links

**About Company:**
Add an about page with:
- Company mission
- Values
- History
- Team information

### Step 3: Update Product Images
Currently using placeholder images from `https://via.placeholder.com/`. Replace with actual product images:

1. Create an `assets/images/` folder
2. Add product images (JPG, PNG, WebP)
3. Update image URLs in `js/products-data.js`

**Example:**
```javascript
// Before:
image: "https://via.placeholder.com/300x300?text=Study+Desk"

// After:
image: "assets/images/study-desk.jpg"
```

### Step 4: Customize Products
Edit `js/products-data.js`:

```javascript
{
  id: 1,
  name: "Your Product Name",
  category: "Furniture",
  price: 299.99,
  originalPrice: 399.99,
  rating: 4.8,
  reviews: 156,
  image: "assets/images/product.jpg",
  description: "Product description",
  tags: ["tag1", "tag2"]
}
```

### Step 5: Add/Edit Blog Posts

#### Add New Blog Post:
1. Create new file in `blog/` folder: `blog/your-post-slug.html`
2. Copy structure from existing blog post
3. Update content, meta tags, and links
4. Add to blog listing in `blog.html`

#### Update Blog Data in `products-data.js`:
```javascript
{
  id: 5,
  title: "Your Blog Title",
  slug: "your-post-slug",
  excerpt: "Brief description...",
  author: "Author Name",
  date: "April 15, 2026",
  category: "Study Tips",
  image: "assets/images/blog-banner.jpg",
  readTime: "5 min read",
  featured: true
}
```

## 🎨 Customization Guide

### Change Color Scheme

Edit `css/style.css` - Update CSS variables:

```css
:root {
  --primary-color: #f5f5f5;        /* Background */
  --secondary-color: #2c2c2c;      /* Dark text */
  --accent-color: #d4a574;         /* Brand color */
  --success-color: #4caf50;        /* Success/positive */
  --danger-color: #f44336;         /* Danger/negative */
  --light-gray: #e8e8e8;
  --medium-gray: #999999;
  --dark-gray: #1a1a1a;
}
```

**Popular Color Schemes:**
- Modern Blue: #3b82f6 (accent)
- Modern Green: #10b981 (accent)
- Modern Purple: #8b5cf6 (accent)
- Warm Orange: #f97316 (accent)

### Change Fonts

In `css/style.css`, update body font-family:

```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

**Alternative fonts:**
- System stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Google Fonts: Import then use in CSS

### Modify Layout

#### Adjust Container Width
In `css/style.css`:
```css
.container {
  max-width: 1400px;  /* Change this value */
}
```

#### Change Product Grid Size
In `css/style.css`:
```css
.products-container {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  /* Increase 260px for larger cards */
}
```

## 🔧 Technical Customization

### Add Payment Gateway

Update `js/script.js` - Modify checkout function:

```javascript
function handleCheckout() {
  // Your payment gateway integration here
  // Example: Stripe, PayPal, Razorpay
  console.log('Processing payment...');
}
```

### Add Email Notifications

In `contact.html` - Update form handler:

```javascript
function handleContactForm(e) {
  // Send email via backend service
  // Example: EmailJS, SendGrid, Nodemailer
}
```

### Database Integration

For backend with Node.js/Python:

1. Create API endpoints for:
   - GET /api/products
   - GET /api/products/:id
   - POST /api/orders
   - GET /api/blogs

2. Update JavaScript to fetch from API:
```javascript
fetch('/api/products')
  .then(res => res.json())
  .then(data => renderProducts(data));
```

## 📱 Mobile Optimization

### Test Responsiveness
- Desktop: 1440px+
- Tablet: 768px - 1024px
- Mobile: 320px - 768px

### Optimize Images
Use responsive images:
```html
<img 
  src="assets/images/product.jpg" 
  srcset="assets/images/product-small.jpg 480w,
          assets/images/product-medium.jpg 768w,
          assets/images/product.jpg 1200w"
  sizes="(max-width: 768px) 480px, 
         (max-width: 1024px) 768px,
         1200px"
  alt="Product description"
>
```

## 🔍 SEO Optimization Tips

### 1. Content Optimization
- Use target keywords 2-3 times naturally
- Write descriptive alt text for all images
- Create unique meta descriptions (155-160 chars)
- Use heading hierarchy correctly (H1, H2, H3)

### 2. Internal Linking
- Link related blog posts
- Link to products from blog
- Use descriptive anchor text

### 3. Technical SEO
- Submit sitemap to Google Search Console
- Submit robots.txt
- Fix broken links
- Optimize page speed
- Ensure mobile responsiveness

### 4. Content Updates
- Add new blog posts regularly
- Update product information
- Refresh old content

## 📊 Analytics Setup

### Google Analytics
Add to all HTML files before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Google Search Console
1. Sign up at search.google.com
2. Add property with sitemap.xml
3. Submit sitemap through admin

### Facebook Pixel
Add before `</body>`:

```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};}
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

## 🚀 Deployment Options

### 1. Netlify
- Connect GitHub repository
- Auto-deploy on push
- Free SSL certificate
- CDN included

### 2. Vercel
- Optimized for web
- Edge functions support
- Analytics included
- Fast deployment

### 3. AWS S3 + CloudFront
- S3 for static hosting
- CloudFront for CDN
- Route 53 for DNS
- Cost-effective

### 4. Traditional Hosting
- cPanel hosting
- FTP file upload
- Custom domain
- Email hosting included

## 🐛 Troubleshooting

### Images Not Showing
- Check image paths are correct
- Use absolute paths or relative paths consistently
- Verify images exist in folder

### Cart Not Persisting
- Check browser localStorage is enabled
- Clear browser cache
- Check console for JavaScript errors

### Products Not Filtering
- Verify category names match exactly
- Check browser console for errors
- Ensure products-data.js is loaded

### Mobile Menu Not Working
- Check hamburger icon is visible
- Verify nav-links has 'active' class
- Check CSS transitions aren't disabled

## 📈 Growth Strategies

### 1. Content Marketing
- Blog 2-3 times per week
- Use long-tail keywords
- Create how-to guides
- Share on social media

### 2. SEO
- Build internal links
- Get backlinks from quality sites
- Optimize for featured snippets
- Local SEO if applicable

### 3. Social Media
- Share products and blogs
- Run social media ads
- Create user-generated content
- Engage with followers

### 4. Email Marketing
- Build email list through newsletter
- Send product updates
- Share blog content
- Create promotional campaigns

## 🔐 Security Best Practices

1. Use HTTPS (SSL certificate)
2. Keep dependencies updated
3. Sanitize form inputs
4. Use environment variables for config
5. Regular backups
6. Monitor for vulnerabilities

## 📝 Checklist Before Launch

- [ ] Replace placeholder domain
- [ ] Update business information
- [ ] Add actual product images
- [ ] Customize product details
- [ ] Update pricing
- [ ] Configure contact form email
- [ ] Test all forms
- [ ] Test responsive design on mobile
- [ ] Test shopping cart
- [ ] Check all links work
- [ ] Optimize images
- [ ] Set up analytics
- [ ] Submit sitemap to GSC
- [ ] Test on multiple browsers
- [ ] Set up backups
- [ ] Enable HTTPS
- [ ] Create privacy policy
- [ ] Create terms of service

## 📞 Support & Updates

For bugs, features, or customization help:
- Check documentation
- Test in different browsers
- Clear cache and reload
- Check console for error messages
- Contact web developer if needed

---

**Last Updated:** April 2026  
**Version:** 1.0

Good luck with your e-commerce website! 🚀
