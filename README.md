# Document Signer & Annotation Tool
It allows users to upload PDF documents, annotate them with highlights, underlines, comments, and signatures, and export the annotated document as a PDF. The application features a modern, responsive design with an intuitive user interface.

## Setup and Running Instructions

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js (or use `yarn` if preferred)
- **Git**: To clone the repository

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/abdulhammed24/pdflux.git
   cd pdflux


## Install Dependencies:
  ```bash
  npm install

## Run the Development Server:
  ```bash
  npm run dev

Open http://localhost:3000 in your browser to view the application.

Build for Production (optional):
```bash
npm run build
npm start

## Libraries and Tools Used

- **Next.js**: Framework for building the SPA with server-side rendering and static site generation capabilities.  
- **react-pdf**: Renders PDF documents in the browser for display and interaction.  
- **pdf-lib**: Manipulates and embeds annotations into the exported PDF.  
- **pdfjs-dist**: Provides PDF rendering and text layer support for annotations.  
- **react-dnd**: Implements drag-and-drop functionality for file uploads.  
- **signature_pad**: Enables freehand signature drawing on the document.  
- **zustand**: Lightweight state management for handling annotations and UI states.  
- **lucide-react**: Provides modern, customizable icons for the UI.  
- **tailwindcss**: Utility-first CSS framework for responsive and sleek styling.  

## Why These Tools?

- **Next.js**: Chosen for its SPA capabilities, built-in routing, and performance optimizations like Turbopack.  
- **react-pdf & pdf-lib**: Essential for PDF rendering and manipulation, ensuring annotations are preserved in exports.  
- **react-dnd**: Simplifies drag-and-drop with a robust API.  
- **signature_pad**: Offers a lightweight solution for signature drawing.  
- **zustand**: Keeps state management simple and performant without boilerplate.  
- **tailwindcss**: Speeds up UI development with responsive, reusable styles.  

## Challenges Faced and Solutions

### PDF Annotation Positioning  
- **Challenge**: Accurately mapping user clicks to PDF coordinates for annotations.  
- **Solution**: Used pdfjs-dist text layer to align annotations with document content and normalized coordinates relative to the viewport.  

### Exporting Annotations  
- **Challenge**: Embedding highlights, underlines, and signatures into the PDF without quality loss.  
- **Solution**: Leveraged pdf-lib to programmatically add annotations as PDF objects, ensuring fidelity to the original document.  

### Responsive Design  
- **Challenge**: Ensuring the annotation tools worked seamlessly across screen sizes.  
- **Solution**: Used TailwindCSS with a mobile-first approach and dynamic viewport scaling for the PDF viewer.  

## Features I Would Add with More Time
- **Annotation Presets**: Save and reuse common annotation styles (e.g., favorite highlight colors).  
- **Multi-Page Support**: Improve navigation and annotation across multiple PDF pages.  
- **Collaboration Features**: Real-time annotation sharing with other users via WebSockets.  
- **Accessibility**: Enhance keyboard navigation and screen reader support for better inclusivity.  
