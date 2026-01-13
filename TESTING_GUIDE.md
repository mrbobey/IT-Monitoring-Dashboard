# 🧪 Testing & Verification Guide

## Prerequisites
Ensure your PostgreSQL database is running and the `DATABASE_URL` environment variable is set.

## Quick Verification Steps

### 1. **Server Health Check**
- ✅ Server starts without syntax errors
- ✅ Multer middleware loaded
- ✅ All routes registered
- Server running at: http://localhost:3000

### 2. **Database Migrations**
Once connected to your database, the following columns will be automatically added:
- `materials.image_path` (TEXT)
- `branch_pcs.motherboard_serial` (TEXT)
- `branch_pcs.pc_image_path` (TEXT)

### 3. **Parts Inventory Testing**

#### Test Clickable Summary Cards:
1. Navigate to Inventory page
2. Click "Total Items" card → Should show all items
3. Click "Available" card → Should filter to Available items only
4. Click "Dispatched" card → Should filter to Dispatched items only
5. Click "Needs Attention" card → Should filter to Needs Attention items only
6. Verify active card has highlighted background

#### Test Part Type Filtering:
1. In "By Part Type" section, click any part type card (e.g., "RAM")
2. Inventory list should filter to show only RAM items
3. Clicked card should have highlighted border and background
4. Click another part type → list updates, highlighting moves

#### Test Inventory Item Details:
1. Click any inventory card
2. Modal should open showing:
   - Part image (if uploaded) or placeholder
   - Part name, status, condition badges
   - All specifications in grid layout
   - Edit and Delete buttons
3. Click Edit → should open edit modal
4. Click Delete → should prompt for confirmation

#### Test Image Upload (Add):
1. Click "+ Add Part" button
2. Fill in all required fields
3. Click "Part Image" field and select an image (JPG or PNG)
4. Submit form
5. Verify:
   - Part appears in list
   - Clicking the part shows the uploaded image in detail view

#### Test Image Upload (Edit):
1. Click edit icon on any part
2. Should see "Current Image" preview if image exists
3. Select a new image or leave empty to keep existing
4. Submit form
5. Click the part card to verify image updated/retained

### 4. **PC Specs Testing**

#### Test PC Image & Motherboard Serial (Add):
1. Click "+ Add PC" button
2. Fill in all fields including:
   - Branch Name, City, PC Number (required)
   - Motherboard Serial Number (new field)
   - PC Image (new field - upload JPG/PNG)
3. Submit form
4. Verify PC appears in list

#### Test PC Detail View:
1. Click any PC card
2. Modal should open showing:
   - Large PC image (if uploaded) or placeholder
   - Branch information at top
   - Complete specs in grid layout
   - Motherboard Serial Number displayed
   - Edit and Delete buttons
3. Verify all fields display correctly

#### Test PC Edit with Image:
1. In PC detail modal, click Edit (or edit icon on card)
2. Form should populate with existing data
3. Should see "Current Image" preview if image exists
4. Select new image or leave empty
5. Update Motherboard Serial if needed
6. Submit and verify changes

### 5. **UI/UX Verification**

#### Hover States:
- [ ] Summary cards elevate on hover
- [ ] Part type cards change border color to accent
- [ ] Inventory cards lift with enhanced shadow
- [ ] PC cards have same hover behavior
- [ ] All transitions are smooth (0.3s)

#### Cursor Feedback:
- [ ] All clickable elements show pointer cursor
- [ ] Action buttons show pointer cursor
- [ ] Non-interactive text areas show default cursor

#### Visual Consistency:
- [ ] Dark theme maintained everywhere
- [ ] Accent color (#17c3ff) used consistently
- [ ] Modals match overall theme
- [ ] Spacing and alignment consistent

### 6. **Error Handling**

#### Image Upload Validation:
1. Try uploading a file > 5MB → Should reject
2. Try uploading non-image file → Should reject
3. Try uploading valid JPG → Should succeed
4. Try uploading valid PNG → Should succeed

#### Form Validation:
- [ ] Required fields prevent submission when empty
- [ ] Quantity field only accepts numbers
- [ ] Date fields show proper date picker

### 7. **Browser Console Check**
Open Developer Tools (F12) and verify:
- [ ] No JavaScript errors
- [ ] No failed network requests (except DB if not configured)
- [ ] FormData being sent correctly for image uploads
- [ ] Cache operations working (check console logs)

### 8. **Responsive Design**
Test on different screen sizes:
- [ ] Mobile (< 768px): Cards stack vertically
- [ ] Tablet (768px - 1024px): 2-3 columns
- [ ] Desktop (> 1024px): Full grid layout
- [ ] Modals are centered and scrollable

## 📸 Expected Behaviors

### When adding/editing with image:
```
1. Form submits as FormData (not JSON)
2. Server receives multipart/form-data
3. Multer processes file upload
4. File saved to public/uploads/
5. Path saved to database: /uploads/filename-timestamp.jpg
6. Cache cleared
7. UI refreshes with new data
8. Image displays in detail view
```

### When filtering:
```
1. Click card/filter
2. JavaScript filters local array
3. UI re-renders with filtered items
4. Active filter highlighted
5. Smooth transition
```

## 🐛 Troubleshooting

### Images not displaying:
- Check if `public/uploads/` directory exists
- Verify image path in database starts with `/uploads/`
- Check browser network tab for 404s
- Ensure `app.use('/uploads', express.static(...))` is in server.js

### Filtering not working:
- Open browser console, check for JS errors
- Verify `allInventoryItems` array is populated
- Check if event listeners are attached

### Modal not opening:
- Verify Bootstrap JS is loaded
- Check `viewPartDetail()` or `viewPCDetail()` functions
- Ensure modal HTML exists in DOM

### Upload fails:
- Check file size (must be < 5MB)
- Verify file type (JPG, PNG only)
- Check server logs for multer errors
- Ensure uploads directory has write permissions

## ✅ Success Criteria

All implementations are successful when:
1. ✅ Summary cards filter the inventory list
2. ✅ Part type cards filter the inventory list
3. ✅ Inventory items open detailed modal with image
4. ✅ PC cards open detailed modal with image
5. ✅ Images upload and save correctly
6. ✅ Motherboard serial field works
7. ✅ All hover states are smooth and visible
8. ✅ No console errors
9. ✅ Existing functionality still works
10. ✅ Theme consistency maintained

---

## 🎯 Ready for Production

When all tests pass:
- Deploy to your hosting platform
- Ensure DATABASE_URL is set
- Verify uploads directory exists on server
- Test image upload on production
- Monitor server logs for any issues

**Implementation Status: COMPLETE ✅**
