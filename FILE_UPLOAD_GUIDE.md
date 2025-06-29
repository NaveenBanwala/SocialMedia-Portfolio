# File Upload Functionality Guide

## Overview
This application now supports direct file uploads for both profile images and project images, allowing users to upload files directly from their devices instead of providing URLs.

## Features Implemented

### 1. Profile Image Upload
- **Location**: `/edit-profile` page
- **Functionality**: Users can upload profile pictures directly from their devices
- **File Types**: Images (jpg, png, gif, etc.)
- **Storage**: Files are saved in `backend/demo.naveen/uploads/profiles/`
- **URL Pattern**: `/images/profiles/{filename}`

### 2. Project Image Upload
- **Location**: `/add-project` page (new dedicated page)
- **Functionality**: Users can upload multiple project images directly from their devices
- **File Types**: Images (jpg, png, gif, etc.)
- **Storage**: Files are saved in `backend/demo.naveen/uploads/projects/`
- **URL Pattern**: `/images/projects/{filename}`

### 3. Resume Upload
- **Location**: `/edit-profile` page
- **Functionality**: Users can upload PDF resumes
- **File Types**: PDF files
- **Storage**: Files are saved in `backend/demo.naveen/uploads/resumes/`

## Backend Implementation

### File Storage Structure
```
backend/demo.naveen/uploads/
├── profiles/          # Profile images
├── projects/          # Project images
└── resumes/           # Resume PDFs
```

### Key Backend Files Modified

1. **UserController.java**
   - Added `/api/users/{id}/upload` endpoint for profile images
   - Handles MultipartFile uploads

2. **ProjectsController.java**
   - Added `/api/projects/upload` endpoint for project images
   - Supports multiple image uploads

3. **UserServiceImp.java**
   - Updated `uploadProfileImage()` method
   - Uses UUID for unique filenames
   - Creates organized directory structure

4. **ProjectsServiceImp.java**
   - Handles multiple project image uploads
   - Generates unique filenames with UUID
   - Stores comma-separated image URLs

5. **WebConfig.java**
   - Added static file serving configuration
   - Maps `/images/**` to `uploads/` directory
   - Enables direct access to uploaded files

### File Upload Configuration
```properties
# application.properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=20MB
```

## Frontend Implementation

### Key Frontend Files Modified

1. **EditProfile.jsx**
   - Updated to use proper file upload API
   - Added file input with image type restriction
   - Improved error handling

2. **AddProjectPage.jsx** (New)
   - Dedicated project upload page
   - Multiple image upload support
   - Image preview functionality
   - Remove image capability

3. **Profile.jsx**
   - Added "Add Project" button
   - Better handling of empty project lists
   - Navigation to project upload page

4. **api.jsx**
   - Updated project upload endpoint
   - Proper FormData handling for file uploads

### Components Used

1. **ProfilePicUploader.jsx**
   - Single image upload component
   - Used for profile pictures

2. **ProjectImageUploader.jsx**
   - Multiple image upload component
   - Used for project images

## How to Use

### Uploading Profile Images
1. Navigate to `/edit-profile`
2. Click "Choose File" in the Profile Picture section
3. Select an image from your device
4. Click "Save Profile"
5. The image will be uploaded and displayed in your profile

### Uploading Project Images
1. Navigate to `/add-project` (or click "Add Project" from your profile)
2. Fill in project title and description
3. Click "Choose Files" to select multiple project images
4. Preview the selected images
5. Remove any unwanted images using the × button
6. Click "Upload Project"
7. The project with images will be added to your profile

## Security Features

1. **File Type Validation**: Only image files are accepted for profile and project uploads
2. **File Size Limits**: 5MB per file, 20MB total per request
3. **Unique Filenames**: UUID-based naming prevents conflicts
4. **Organized Storage**: Separate directories for different file types
5. **Authentication Required**: All upload endpoints require user authentication

## API Endpoints

### Profile Image Upload
```
POST /api/users/{id}/upload
Content-Type: multipart/form-data
Body: file (MultipartFile)
```

### Project Upload
```
POST /api/projects/upload
Content-Type: multipart/form-data
Body: 
  - title (String)
  - description (String)
  - userId (Long)
  - images (List<MultipartFile>)
```

## File Access URLs

- **Profile Images**: `http://localhost:8080/images/profiles/{filename}`
- **Project Images**: `http://localhost:8080/images/projects/{filename}`
- **Resume Files**: `http://localhost:8080/images/resumes/{filename}`

## Troubleshooting

### Common Issues

1. **File not uploading**
   - Check file size (max 5MB)
   - Ensure file is an image format
   - Verify user is authenticated

2. **Images not displaying**
   - Check if uploads directory exists
   - Verify WebConfig static file serving is working
   - Check file permissions on uploads directory

3. **Multiple file upload issues**
   - Ensure all files are images
   - Check total request size (max 20MB)
   - Verify frontend is sending correct FormData

### Development Setup

1. Ensure uploads directories exist:
   ```bash
   mkdir -p backend/demo.naveen/uploads/profiles
   mkdir -p backend/demo.naveen/uploads/projects
   mkdir -p backend/demo.naveen/uploads/resumes
   ```

2. Restart the backend server after configuration changes

3. Test file uploads with small images first

## Future Enhancements

1. **Image Compression**: Automatically compress large images
2. **Image Resizing**: Generate thumbnails for better performance
3. **Cloud Storage**: Integrate with AWS S3 or similar for production
4. **File Validation**: Add virus scanning and additional security checks
5. **Progress Indicators**: Add upload progress bars for better UX 