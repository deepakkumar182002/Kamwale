# Vercel Deployment Fix for Registration Error

## 🚨 **Issue**: 500 Internal Server Error on User Registration

The registration endpoint is failing on Vercel deployment. Follow these steps to resolve:

## 🔧 **Step 1: Set Environment Variables in Vercel**

Go to your Vercel dashboard and add these environment variables:

### Required Variables:
```bash
NEXTAUTH_SECRET=your_secure_random_string_here
NEXTAUTH_URL=https://kamwale-tlbc-kw8ae86uq-deepak-kumars-projects-dc87fd70.vercel.app
DATABASE_URL=your_postgresql_connection_string
```

### How to set them:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable above

## 🗄️ **Step 2: Verify Database Connection**

Make sure your `DATABASE_URL` is correct and accessible from Vercel:

```bash
# Format should be:
postgresql://username:password@host:port/database_name

# Example:
postgresql://user123:pass456@db.example.com:5432/myapp_db
```

## 🔍 **Step 3: Run Diagnostics**

After setting environment variables, visit this URL to check deployment status:
```
https://kamwale-tlbc-kw8ae86uq-deepak-kumars-projects-dc87fd70.vercel.app/api/diagnostics
```

This will show:
- ✅ Environment variables status
- ✅ Database connection status  
- ✅ Any specific error messages

## 📦 **Step 4: Deploy Database Changes**

Run Prisma migrations on your production database:

```bash
# If using Vercel Postgres or similar:
npx prisma migrate deploy

# Or if using external database:
npx prisma db push
```

## 🔄 **Step 5: Redeploy**

After setting environment variables:
1. Go to Vercel dashboard
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment

## 🧪 **Step 6: Test Registration**

Try registering again at:
```
https://kamwale-tlbc-kw8ae86uq-deepak-kumars-projects-dc87fd70.vercel.app/register
```

## 🚨 **Common Issues & Solutions**

### Issue: "Database connection not configured"
**Solution**: Set `DATABASE_URL` in Vercel environment variables

### Issue: "Database connection failed"  
**Solution**: 
- Check DATABASE_URL format
- Ensure database is accessible from Vercel
- Verify database credentials

### Issue: "Prisma client not found"
**Solution**: Redeploy after setting environment variables

### Issue: "Table doesn't exist"
**Solution**: Run `npx prisma migrate deploy` or `npx prisma db push`

## 📋 **Quick Checklist**

- [ ] `NEXTAUTH_SECRET` set in Vercel
- [ ] `NEXTAUTH_URL` set to your Vercel app URL  
- [ ] `DATABASE_URL` set with valid PostgreSQL connection
- [ ] Database migrations deployed
- [ ] App redeployed after env var changes
- [ ] Diagnostics endpoint returns "connected" status

## 🆘 **If Still Failing**

1. Check Vercel function logs in dashboard
2. Visit `/api/diagnostics` for detailed error info
3. Ensure your database provider allows connections from Vercel
4. Try using Vercel Postgres if using external database fails

## 💡 **Alternative: Use Vercel Postgres**

If external database isn't working, you can use Vercel's built-in Postgres:

1. Go to Vercel dashboard > Storage
2. Create a Postgres database
3. Copy the connection string to `DATABASE_URL`
4. Redeploy

This will automatically handle the connection and migrations.
