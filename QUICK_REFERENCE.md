# 🎯 Quick Reference Card - New Features

## 📦 PARTS INVENTORY

### Clickable Summary Cards (Top Row)
| Card | Action | Result |
|------|--------|--------|
| **Total Items** | Click → | Shows all inventory items |
| **Available** | Click → | Filters to "Available" status only |
| **Dispatched** | Click → | Filters to "Dispatched" status only |
| **Needs Attention** | Click → | Filters to "Needs Attention" only |

*Visual: Active card gets highlighted blue background*

---

### Part Type Cards (Second Row)
| Example | Action | Result |
|---------|--------|--------|
| **RAM (5)** | Click → | Shows only RAM parts |
| **Motherboard (3)** | Click → | Shows only Motherboards |
| **Any Type** | Click → | Filters to that type |

*Visual: Active card gets accent-colored border*

---

### Inventory Cards (Main List)
| Action | Result |
|--------|--------|
| **Click anywhere on card** | Opens detail modal with image + full specs |
| **Click Edit icon** | Opens edit form |
| **Click Delete icon** | Prompts for deletion |

**Detail Modal Shows:**
- 📸 Full-size image (or placeholder)
- 📊 All part specifications
- 🎯 Status and condition badges
- 🔧 Edit and Delete buttons

---

### Adding Parts with Images
```
1. Click "+ Add Part" button
2. Fill in all fields:
   ✓ Part Type (required)
   ✓ Part Name (required)
   ✓ Quantity (required)
   ✓ Serial Number (optional)
   ✓ Warranty Date (optional)
   ✓ Part Image (NEW - optional)
   ✓ Condition (required)
   ✓ Status (required)
3. Select image: JPG or PNG, max 5MB
4. Click "Add Part"
5. ✅ Part appears with image
```

---

### Editing Parts
```
1. Click Edit icon on any part
2. Form shows current values
3. Current image displayed if exists
4. Select new image OR leave empty to keep existing
5. Click "Save Changes"
6. ✅ Updates with new/existing image
```

---

## 🖥️ PC SPECS MONITORING

### PC Cards (Main List)
| Action | Result |
|--------|--------|
| **Click anywhere on card** | Opens detail modal with image + full specs |
| **Click Edit icon** | Opens edit form |
| **Click Delete icon** | Prompts for deletion |

**Detail Modal Shows:**
- 📸 Large PC image (or placeholder)
- 🏢 Branch and location info
- 💻 All hardware specifications
- 🔢 Motherboard Serial Number (NEW)
- 🔧 Edit and Delete buttons

---

### Adding PCs with Images & Serial
```
1. Click "+ Add PC" button
2. Fill in fields:
   ✓ Branch Name * (required)
   ✓ City * (required)
   ✓ Desktop Name * (required)
   ✓ PC Number * (required)
   ✓ Branch Code (optional)
   ✓ Processor (optional)
   ✓ RAM (optional)
   ✓ Storage (optional)
   ✓ Motherboard (optional)
   ✓ Motherboard Serial (NEW - optional)
   ✓ PSU (optional)
   ✓ Monitor (optional)
   ✓ PC Image (NEW - optional)
3. Upload image: JPG or PNG, max 5MB
4. Click "Save"
5. ✅ PC appears with all new fields
```

---

### Editing PCs
```
1. Click Edit icon on PC card
2. Form populates with current data
3. Current image shown if exists
4. Update any fields including:
   - Motherboard Serial Number
   - PC Image (select new or keep existing)
5. Click "Save"
6. ✅ Updates with new data
```

---

## 🎨 VISUAL FEEDBACK

### Hover Effects
- **Cards**: Lift up with enhanced shadow
- **Summary Cards**: Brighter background
- **Part Type Cards**: Accent-colored border
- **Buttons**: Slight color change

### Active States
- **Filtered Cards**: Blue/accent background highlight
- **Selected Type**: Accent border + background

### Transitions
- All animations: 0.3s smooth ease
- Transform: translateY (lift effect)
- Shadow: Enhanced on hover

---

## 💾 IMAGE SPECIFICATIONS

### Supported Formats
- ✅ JPG / JPEG
- ✅ PNG
- ❌ GIF (backend supports but not recommended)

### File Size Limit
- **Maximum**: 5MB per image
- **Recommended**: < 2MB for faster loading

### Storage Location
- **Directory**: `public/uploads/`
- **Format**: `fieldname-timestamp-random.ext`
- **Example**: `part_image-1705090234567-123456789.jpg`

### Database Storage
- **Field Type**: TEXT
- **Stored Value**: `/uploads/filename.jpg` (relative path)
- **Display**: `<img src="/uploads/filename.jpg">`

---

## ⚡ SHORTCUTS & TIPS

### Quick Filtering
1. **Clear All Filters**: Click "Clear" button or "Total Items" card
2. **Multiple Filters**: Use dropdowns + card clicks together
3. **Search + Filter**: Type in search box while filter is active

### Image Best Practices
- Take clear, well-lit photos
- Crop to show only the item
- Use consistent backgrounds
- Keep file sizes reasonable
- Name files descriptively before upload

### Navigation
- **Dashboard** → Main task overview
- **Inventory** → Parts management with filters
- **PC Specs** → Computer hardware tracking

---

## 🔧 TROUBLESHOOTING

### Image won't upload
- ✅ Check file size (< 5MB)
- ✅ Verify format (JPG or PNG)
- ✅ Try different browser
- ✅ Check console for errors (F12)

### Filter not working
- ✅ Reload page
- ✅ Click "Clear" button
- ✅ Check browser console

### Modal won't open
- ✅ Ensure JavaScript is enabled
- ✅ Hard refresh (Ctrl+Shift+R)
- ✅ Check for console errors

### Image not displaying
- ✅ Verify upload was successful
- ✅ Check network tab (F12 → Network)
- ✅ Ensure uploads directory exists
- ✅ Check file permissions

---

## 📞 SUPPORT

### Log Files
- Server logs show upload status
- Browser console shows JS errors
- Network tab shows API calls

### Common Issues
| Issue | Solution |
|-------|----------|
| Database connection failed | Set DATABASE_URL env var |
| Uploads directory missing | Created automatically |
| Images 404 error | Check static route in server.js |
| Modal not styled | Clear browser cache |

---

## ✅ FEATURE CHECKLIST

**Parts Inventory:**
- [x] Clickable summary cards with filtering
- [x] Clickable part type cards with filtering
- [x] Clickable inventory items with detail modal
- [x] Image upload in Add Part form
- [x] Image upload in Edit Part form
- [x] Image display in detail modal

**PC Specs:**
- [x] Motherboard Serial Number field
- [x] PC Image upload in Add PC form
- [x] PC Image upload in Edit PC form
- [x] Clickable PC cards with detail modal
- [x] Image display in detail modal

**UI/UX:**
- [x] Enhanced hover states on all cards
- [x] Smooth transitions (0.3s)
- [x] Visual feedback on clicks
- [x] Consistent dark theme
- [x] Responsive design

**Backend:**
- [x] Database schema updated
- [x] Image storage system (multer)
- [x] API endpoints updated
- [x] File validation

---

*Quick Reference v1.0 - January 12, 2026*
