# Binsr Inspect - Property Inspection Report Generator

A comprehensive Next.js application for generating professional property inspection reports with support for multiple output formats including TREC-compliant forms and modern styled reports.

## 🚀 Features

- **Multiple Report Formats**: Generate both TREC Property Inspection Report forms and modern inspection reports
- **PDF Generation**: Dynamic PDF creation using Puppeteer and PDF-lib
- **Template Engine**: Handlebars-based templating system for flexible report layouts
- **Media Support**: Image and video embedding in reports with optimization
- **Tag System**: Color-coded comment categorization (Info, Defect, Limit, Recommendation, Warning, Deficiency)
- **Clickable TOC**: Interactive table of contents for easy navigation

## 🛠️ Technologies Used

### Core Framework
- **Next.js 16.0.1** - React-based web framework
- **React 19.2.0** - Frontend library
- **TypeScript 5** - Type-safe JavaScript

### UI & Utilities
- **clsx 2.1.1** - Conditional CSS class names
- **tailwind-merge 3.3.1** - Tailwind CSS class merging utility
- **@bprogress/next 3.2.12** - Progress bar for Next.js
- **sonner 2.0.7** - Toast notifications
- **next-themes 0.4.6** - Theme management

### PDF Generation & Processing
- **Puppeteer 24.27.0** - Headless Chrome for PDF generation
- **PDF-lib 1.17.1** - PDF manipulation and merging
- **Handlebars 4.7.8** - Template engine
- **he 1.2.0** - HTML entity encoding/decoding
- **Sharp 0.34.4** - Image processing and optimization

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript 5** - Static type checking

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Binsr-inspect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── generate-trec/        # TREC report generation endpoint
│   │   └── custom-report-generation/ # Modern report endpoint
│   ├── auth/                     # Authentication pages
│   ├── demo/                     # Demo pages
│   └── modern-report-preview/    # Report preview pages
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   └── auth/                     # Authentication components
├── lib/                          # Utility libraries
│   ├── pdf/                      # PDF generation utilities
│   ├── inspection-data.json      # Sample inspection data
│   └── utils.ts                  # Helper functions
├── public/
│   └── templates/                # HTML templates for reports
│       ├── modern-inspection-report.html
│       └── trec-inspection-form.html
└── types/                        # TypeScript type definitions
```

## 🎯 Approach & Architecture

### Report Generation Pipeline

1. **Data Processing**: Inspection data is loaded from JSON and processed through TypeScript interfaces
2. **Template Compilation**: Handlebars templates are compiled with helper functions for formatting
3. **PDF Generation**: Dynamic HTML-to-PDF conversion using Puppeteer with complete TREC form structure
4. **Post-Processing**: Page numbers and formatting are added using PDF-lib

### Template System

The application uses dynamic HTML templates for PDF generation:

- **TREC Forms**: Complete HTML-based TREC Property Inspection Report forms with full compliance
- **Modern Reports**: Contemporary design with enhanced readability and interactive features

### Helper Functions

Custom Handlebars helpers provide:
- Roman numeral conversion (`toRoman`)
- Letter indexing (`indexToLetter`)
- Comment formatting (`formatCommentText`)
- Conditional rendering (`hasComments`, `eq`)

### Media Handling

- Image optimization with configurable quality and dimensions
- Video embedding with external player links
- Responsive media grids for multiple attachments

## 📋 Key Assumptions

### Data Structure
- Inspection data follows a structured JSON format with sections, line items, and comments
- Each comment can have optional location, tag, and type properties
- Media files (images/videos) are accessible via URL with Firebase Storage integration

### PDF Requirements
- TREC forms must maintain specific formatting and field placement
- Modern reports prioritize readability and visual appeal
- Page numbering and footer information are automatically generated

### Browser Compatibility
- Puppeteer requires a Chromium-based environment for PDF generation
- Modern CSS features are used (Grid, Flexbox) assuming recent browser versions

### Performance Considerations
- Image optimization is handled client-side with Sharp
- Large inspection datasets may require pagination or lazy loading
- PDF generation is server-side to ensure consistent output

### Template Flexibility
- Templates are designed to handle missing or optional data gracefully
- Comment tags support multiple types with color-coded styling
- Table of contents automatically generates from available sections

## 🔧 Configuration

### Environment Variables
No specific environment variables are required for basic operation. The application uses:
- Static file serving for templates
- Local JSON data for demonstration
- Client-side PDF generation

### Customization
- Modify templates in `public/templates/` for different report styles
- Adjust PDF settings in `lib/utils.ts` for different page formats
- Update type definitions in `types/` for different data structures

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For internal development:
1. Create feature branches from `master`
2. Follow TypeScript and ESLint conventions
3. Test PDF generation with various data sets
4. Ensure responsive design across devices
