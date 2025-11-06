import { useState, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useDropzone } from 'react-dropzone';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Import your logos from assets folder
import logo from '../assets/col-kitelogo-removebg-preview2.jpg';
import pyExpoLogo from '../assets/PyExpoLogo.svg';
import techCommunityLogo from '../assets/ips.webp';

const Template = () => {
  // Assignment details (fixed)
  const ASSIGNMENT_DETAILS = {
    title: 'Assignment 1',
    courseTitle: 'Python Programming',
    courseCode: '24UCS171',
    totalMarks: 40,
    questionsCount: 5,
    marksPerQuestion: 8
  };

  // Questions data
  const QUESTIONS = [
    {
      id: 1,
      title: "Tuition Fee Calculation",
      description: "A student needs to calculate their final tuition fees after accounting for fixed costs and scholarships. Write a program that uses variables for each fixed input value, calculates the initial_total (Base Tuition + Technology Fee), and then determines the final_amount_due (Initial Total - Scholarship Amount).",
      concept: "Variable, Assignment, Output (VAO)",
      input: "Use the following fixed values internally (No user input required for this question):\n• Base Tuition: $4,500.00\n• Technology Fee: $150.00\n• Scholarship Amount: $800.00",
      output: "Print the calculated Initial Total Due and the Final Amount Due, clearly labeled and formatted to two decimal places."
    },
    {
      id: 2,
      title: "Box Volume Calculation",
      description: "A piece of cardboard is cut and folded into an open-top box. The calculation of the final volume depends on following a precise sequence of steps. Write a program that takes the initial side length and the corner cut size as input, and then implements the following sequence of steps to find the volume:\n1. Receive the two inputs (initial_side and cut_size).\n2. Calculate Length and Width: L = initial_side - (2 × cut_size).\n3. Set Height H = cut_size.\n4. Calculate Volume: V = L × W × H.",
      concept: "Sequence",
      input: "Two lines of input, each containing a floating-point number: the initial side length and the cut size.",
      output: "Print the final box_volume clearly labeled and formatted to two decimal places."
    },
    {
      id: 3,
      title: "Grade Determination",
      description: "Write a program using if-elif-else statements to take a numerical score as input and assign the corresponding letter grade based on the college's standard scale. The program must be able to handle any valid score from 0 to 100.\n\nGrading Scale:\n• Score is 90 or greater: A\n• Score is 80 or greater (but less than 90): B\n• Score is 70 or greater (but less than 80): C\n• Score is 60 or greater (but less than 70): D\n• Score is less than 60: F",
      concept: "Conditionals (if/elif/else)",
      input: "A single integer, representing the student's numerical score (0-100).",
      output: "A single line of output stating the assigned letter grade (e.g., \"Assigned Grade: C\")."
    },
    {
      id: 4,
      title: "Compound Interest Projection",
      description: "You need to project how a savings account balance will grow monthly over a two-year period (24 months) using compound interest. Write a program that uses a loop (iteration) to simulate the 24 months of growth. Use an if-conditional inside the loop to check the month number and report the accumulated balance specifically at the end of Year 1 (Month 12) and Year 2 (Month 24).",
      concept: "Iteration (Loop)",
      input: "Two lines of input, each containing a floating-point number:\n• The initial principal amount.\n• The monthly interest rate (as a decimal, e.g., 0.005).",
      output: "Two lines of output, showing the accumulated balance after 12 months and 24 months, clearly labeled and formatted to two decimal places."
    },
    {
      id: 5,
      title: "Simple Interest Function",
      description: "Define a reusable function named calculate_simple_interest that takes the Principal (P), Annual Rate (R), and Time in years (T) as arguments. The function must return the calculated simple interest (I = P × R × T). The main part of the program must take the values for P, R, and T as input from the user, call the defined function with the user's input, and print the result.",
      concept: "Functions",
      input: "Three lines of input, each containing a floating-point number: Principal (P), Annual Rate (R), and Time in years (T).",
      output: "A single line of output showing the calculated interest, clearly labeled and formatted to two decimal places."
    }
  ];
  
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    registrationNo: '',
    department: '',
    submissionDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  });
  
  // State for questions - each question has code, output image, and justification
  const [questions, setQuestions] = useState(() => 
    QUESTIONS.map(q => ({
      id: q.id,
      code: '',
      outputImage: null,
      outputImagePreview: null,
      justification: ''
    }))
  );
  
  // State for form validation and submission
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // References to form elements
  const formRef = useRef(null);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle question input changes
  const handleQuestionChange = useCallback((id, field, value) => {
    setQuestions(prevQuestions => prevQuestions.map(question => 
      question.id === id ? { ...question, [field]: value } : question
    ));
  }, []);

  // Handle image upload for output
  const handleImageUpload = useCallback((id, file) => {
    if (file && file.type.startsWith('image/')) {
      console.log(`Uploading image for question ${id}:`, file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestions(prevQuestions => {
          const updatedQuestions = prevQuestions.map(question => 
            question.id === id ? { 
              ...question, 
              outputImage: file,
              outputImagePreview: e.target.result 
            } : question
          );
          console.log(`Updated questions for question ${id}:`, updatedQuestions);
          return updatedQuestions;
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Prevent copy-paste for text inputs
  const preventCopyPaste = (e) => {
    e.preventDefault();
    alert("Copy-paste is not allowed. Please type manually.");
    return false;
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Validate personal details
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.rollNo) newErrors.rollNo = "Roll number is required";
    if (!formData.registrationNo) newErrors.registrationNo = "Registration number is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    // Validate questions - all fields required
    questions.forEach((question) => {
      if (!question.code.trim()) {
        newErrors[`code${question.id}`] = `Code for Question ${question.id} is required`;
      }
      if (!question.outputImage) {
        newErrors[`output${question.id}`] = `Output screenshot for Question ${question.id} is required`;
      }
      if (!question.justification.trim()) {
        newErrors[`justification${question.id}`] = `Justification for Question ${question.id} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is complete for PDF generation
  const isFormComplete = () => {
    return formData.name && 
           formData.rollNo && 
           formData.registrationNo && 
           formData.department &&
           questions.every(q => q.code.trim() && q.outputImage && q.justification.trim());
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      // Here you would typically send data to your backend
      // For this example, we'll just generate the PDF
      generatePDF();
    }
  };

  // Generate PDF from form data
  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      // Helper function to load images
      const loadImageAsDataURL = (imageSrc) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = imageSrc;
        });
      };

      // Helper function to add page with border and logos
      const addNewPage = async () => {
        pdf.addPage();
        
        // Add border
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
        
        try {
          // Load and add logos
          const [collegeLogoData, pyExpoLogoData, ipsLogoData] = await Promise.all([
            loadImageAsDataURL(logo),
            loadImageAsDataURL(pyExpoLogo),
            loadImageAsDataURL(techCommunityLogo)
          ]);

          pdf.addImage(collegeLogoData, 'PNG', 8, 8, 25, 18);
          pdf.addImage(pyExpoLogoData, 'PNG', pageWidth - 28, 8, 20, 18);
          pdf.addImage(ipsLogoData, 'PNG', pageWidth - margin - 12, pageHeight - 20, 12, 12);
        } catch (logoError) {
          console.log('Logo loading error:', logoError);
        }
      };

      // Add border and logos to first page
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      try {
        const [collegeLogoData, pyExpoLogoData, ipsLogoData] = await Promise.all([
          loadImageAsDataURL(logo),
          loadImageAsDataURL(pyExpoLogo),
          loadImageAsDataURL(techCommunityLogo)
        ]);

        pdf.addImage(collegeLogoData, 'PNG', 8, 8, 30, 22);
        pdf.addImage(pyExpoLogoData, 'PNG', pageWidth - 30, 8, 22, 22);
        pdf.addImage(ipsLogoData, 'PNG', pageWidth - margin - 15, pageHeight - 25, 15, 15);
      } catch (logoError) {
        console.log('Logo loading error:', logoError);
      }
      
      let yPos = margin + 32;
      
      // Assignment Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 139);
      pdf.text(ASSIGNMENT_DETAILS.title, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${ASSIGNMENT_DETAILS.courseTitle} (${ASSIGNMENT_DETAILS.courseCode})`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      
  pdf.setFontSize(12);
  // ASSIGNMENT_DETAILS.class may be undefined — provide a safe fallback to avoid jsPDF errors
  pdf.text(ASSIGNMENT_DETAILS.class || '', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Student Details
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const leftCol = margin;
      const rightCol = pageWidth / 2 + 10;
      const lineHeight = 7;
      const labelWidth = 35;
      
      // Row 1: Name and Roll No
      pdf.setFont('helvetica', 'bold');
      pdf.text('Name:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.name, leftCol + labelWidth, yPos);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Roll No:', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.rollNo, rightCol + labelWidth, yPos);
      yPos += lineHeight;
      
      // Row 2: Registration No and Date
      pdf.setFont('helvetica', 'bold');
      pdf.text('Registration No:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.registrationNo, leftCol + labelWidth, yPos);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
  pdf.text(formData.submissionDate, rightCol + labelWidth, yPos);
  yPos += lineHeight;

  // Row 3: Department (only shown on the front/main page)
  pdf.setFont('helvetica', 'bold');
  pdf.text('Department:', leftCol, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formData.department || '', leftCol + labelWidth, yPos);
  yPos += lineHeight + 5;
      
      // Total Marks
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Marks: ${ASSIGNMENT_DETAILS.totalMarks}`, pageWidth - margin - 40, yPos, { align: 'right' });
      yPos += 15;
      
      // Process each question on separate pages
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionData = QUESTIONS[i];
        
        // Add new page for each question (except first)
        if (i > 0) {
          await addNewPage();
          yPos = margin + 32;
        }
        
        // Question header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 139);
        pdf.text(`Question ${question.id}: ${questionData.title}`, leftCol, yPos);
        yPos += 8;
        
        // Problem description
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const descLines = pdf.splitTextToSize(questionData.description, pageWidth - 2 * margin);
        pdf.text(descLines, leftCol, yPos);
        yPos += descLines.length * 4 + 4;
        
        // Core concept
        pdf.setFont('helvetica', 'bold');
        pdf.text('Core Concept: ', leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(questionData.concept, leftCol + 25, yPos);
        yPos += 8;
        
        // Student's Code
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Student Code:', leftCol, yPos);
        yPos += 5;
        
        // Code box - more accurate height calculation
        const codeLineCount = question.code.split('\n').length;
        const codeHeight = Math.max(40, Math.min(70, codeLineCount * 3 + 8));
        pdf.setLineWidth(0.3);
        pdf.rect(leftCol, yPos, pageWidth - 2 * margin, codeHeight);
        
        // Add code text
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(8);
        const codeLines = pdf.splitTextToSize(question.code, pageWidth - 2 * margin - 6);
        pdf.text(codeLines, leftCol + 3, yPos + 5);
        yPos += codeHeight + 6;
        
        // Output section
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Output Screenshot:', leftCol, yPos);
        yPos += 5;
        
        // Output image
        if (question.outputImage) {
          try {
            const outputImageData = question.outputImagePreview;
            const imgWidth = Math.min(80, pageWidth - 2 * margin);
            const imgHeight = 40;
            pdf.addImage(outputImageData, 'PNG', leftCol, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 6;
          } catch (imgError) {
            // Fallback if image fails
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.text('[Output image could not be displayed]', leftCol, yPos);
            yPos += 6;
          }
        }
        
        // Justification
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Justification:', leftCol, yPos);
        yPos += 5;
        
        const justificationLineCount = question.justification.split('\n').length;
        const justificationHeight = Math.max(25, Math.min(35, justificationLineCount * 4 + 10));
        pdf.setLineWidth(0.3);
        pdf.rect(leftCol, yPos, pageWidth - 2 * margin, justificationHeight);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const justificationLines = pdf.splitTextToSize(question.justification, pageWidth - 2 * margin - 6);
        pdf.text(justificationLines, leftCol + 3, yPos + 5);
        yPos += justificationHeight + 8;
      }
      
      // Comprehensive Rubrics Page
      await addNewPage();
      yPos = margin + 35;

      // Rubrics Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 139);
      pdf.text('MARKING RUBRICS', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;


      // Comprehensive Rubrics Table for All Questions
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('DETAILED MARKING CRITERIA', leftCol, yPos);
      yPos += 12;

      // Table structure: Question | Criteria | Max Marks | Obtained Marks
      const rubricColWidths = [15, 90, 25, 30];
      let currentX = leftCol;

      // Rubric definitions
      const rubricCriteria = [
        'Code Implementation',
        'Output Screenshot',
        'Justification'
      ];
      const rubricMarks = [4, 2, 2];

      // Estimate layout and switch to compact mode if needed so the evaluator block fits
      const usableHeight = pageHeight - margin - 30; // leave room for footer
      const headerHeight = 15;
      const studentDetailsHeight = 20;
      const detailedHeaderHeight = 12;
      const tableHeaderHeight = 10;
      const perCriteriaRowHeight = 8;
      const subtotalRowHeight = 8;
      const perQuestionHeight = (perCriteriaRowHeight * rubricCriteria.length) + subtotalRowHeight;
      const questionsHeight = perQuestionHeight * QUESTIONS.length;
      const grandTotalHeight = 20;
      const evaluatorEstimatedHeight = 110; // title + 3 lines + signature + remarks
      const estimatedTotal = headerHeight + studentDetailsHeight + detailedHeaderHeight + tableHeaderHeight + questionsHeight + grandTotalHeight + evaluatorEstimatedHeight;
      const compact = estimatedTotal > usableHeight;

      // Adjust fonts/row heights for compact mode
      const headerFontSize = compact ? 11 : 12;
      const tableFontSize = compact ? 8 : 9;
      const rowHeight = compact ? 7 : 8;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(tableFontSize);

      // Table Headers
      pdf.rect(currentX, yPos, rubricColWidths[0], tableHeaderHeight, 'S');
      pdf.text('Q.No', currentX + rubricColWidths[0]/2, yPos + tableHeaderHeight/2 + (compact ? 2 : 1.5), { align: 'center' });
      currentX += rubricColWidths[0];

      pdf.rect(currentX, yPos, rubricColWidths[1], tableHeaderHeight, 'S');
      pdf.text('Criteria', currentX + 2, yPos + tableHeaderHeight/2 + (compact ? 2 : 1.5));
      currentX += rubricColWidths[1];

      pdf.rect(currentX, yPos, rubricColWidths[2], tableHeaderHeight, 'S');
      pdf.text('Max Marks', currentX + rubricColWidths[2]/2, yPos + tableHeaderHeight/2 + (compact ? 2 : 1.5), { align: 'center' });
      currentX += rubricColWidths[2];

      pdf.rect(currentX, yPos, rubricColWidths[3], tableHeaderHeight, 'S');
      pdf.text('Obtained', currentX + rubricColWidths[3]/2, yPos + tableHeaderHeight/2 + (compact ? 2 : 1.5), { align: 'center' });

      yPos += tableHeaderHeight;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(tableFontSize);

      let grandTotal = 0;

      // Add rubrics for each question (populate obtained marks from available student inputs)
      QUESTIONS.forEach((questionData, qIndex) => {
        const studentQ = questions[qIndex] || { code: '', outputImage: null, justification: '' };
        let questionSubtotal = 0;

        rubricCriteria.forEach((criteria, cIndex) => {
          currentX = leftCol;

          // Question number (only show on first criteria row)
          pdf.rect(currentX, yPos, rubricColWidths[0], rowHeight, 'S');
          if (cIndex === 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text((qIndex + 1).toString(), currentX + rubricColWidths[0]/2, yPos + rowHeight/2 + (compact ? 2 : 1.5), { align: 'center' });
            pdf.setFont('helvetica', 'normal');
          }
          currentX += rubricColWidths[0];

          // Criteria
          pdf.rect(currentX, yPos, rubricColWidths[1], rowHeight, 'S');
          pdf.text(criteria, currentX + 2, yPos + rowHeight/2 + (compact ? 2 : 1.5));
          currentX += rubricColWidths[1];

          // Max marks
          pdf.rect(currentX, yPos, rubricColWidths[2], rowHeight, 'S');
          pdf.text(rubricMarks[cIndex].toString(), currentX + rubricColWidths[2]/2, yPos + rowHeight/2 + (compact ? 2 : 1.5), { align: 'center' });
          currentX += rubricColWidths[2];

          // Obtained marks column left intentionally empty (evaluators will fill these)
          pdf.rect(currentX, yPos, rubricColWidths[3], rowHeight, 'S');

          // Do NOT auto-fill obtained marks here. Leave questionSubtotal unchanged
          // so that obtained/subtotal/grand total remain blank in the PDF.
          yPos += rowHeight;
        });

        // Question subtotal row
        currentX = leftCol;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.setDrawColor(0, 0, 0);
        pdf.setFillColor(240, 240, 240);

        // Draw filled rectangles for first 3 columns
        pdf.rect(currentX, yPos, rubricColWidths[0], subtotalRowHeight, 'F');
        pdf.setLineWidth(0.3);
        pdf.rect(currentX, yPos, rubricColWidths[0], subtotalRowHeight, 'S');
        currentX += rubricColWidths[0];

        pdf.rect(currentX, yPos, rubricColWidths[1], subtotalRowHeight, 'F');
        pdf.rect(currentX, yPos, rubricColWidths[1], subtotalRowHeight, 'S');
        pdf.text(`Question ${qIndex + 1} Total`, currentX + 2, yPos + subtotalRowHeight/2 + (compact ? 2 : 1.5));
        currentX += rubricColWidths[1];

        // Max marks (outline only) to avoid filled/black boxes in generated PDF
        pdf.rect(currentX, yPos, rubricColWidths[2], subtotalRowHeight, 'S');
        pdf.text((rubricMarks.reduce((a,b)=>a+b,0)).toString(), currentX + rubricColWidths[2]/2, yPos + subtotalRowHeight/2 + (compact ? 2 : 1.5), { align: 'center' });
        currentX += rubricColWidths[2];

        // Last column - show obtained subtotal (left empty for evaluator)
        pdf.rect(currentX, yPos, rubricColWidths[3], subtotalRowHeight, 'S');
        pdf.setFont('helvetica', 'normal');

        // Do NOT write questionSubtotal here; keep evaluator column blank

        // Keep grandTotal unmodified (we are not auto-filling obtained values)
        // grandTotal += questionSubtotal; // intentionally not updating grandTotal
        yPos += subtotalRowHeight;
      });

      // Grand Total Row
      currentX = leftCol;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(headerFontSize);
      pdf.setTextColor(0, 0, 0);
      pdf.setDrawColor(0, 0, 0);
      pdf.setFillColor(220, 220, 220);

      // Draw filled rectangle for first two columns combined
      pdf.rect(currentX, yPos, rubricColWidths[0] + rubricColWidths[1], 12, 'F');
      pdf.setLineWidth(0.3);
      pdf.rect(currentX, yPos, rubricColWidths[0] + rubricColWidths[1], 12, 'S');
      pdf.text('GRAND TOTAL', currentX + 5, yPos + 8);
      currentX += rubricColWidths[0] + rubricColWidths[1];

      // Max marks column (outline only - avoid fill to prevent black boxes)
      pdf.rect(currentX, yPos, rubricColWidths[2], 12, 'S');
      pdf.text( (ASSIGNMENT_DETAILS.totalMarks).toString(), currentX + rubricColWidths[2]/2, yPos + 8, { align: 'center' });
      currentX += rubricColWidths[2];

      // Last column - display grand total obtained (left empty for evaluator)
      pdf.rect(currentX, yPos, rubricColWidths[3], 12, 'S');
      // Do NOT write grandTotal here; keep the Obtained grand total blank

      pdf.setTextColor(0, 0, 0);
      yPos += 20;

      // Evaluator Section on Rubrics Page
      // Ensure evaluator block fits — if compact mode triggered, layout already tightened
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('EVALUATOR SECTION', leftCol, yPos);
      yPos += 10;

      // Evaluator details
      const evalColWidths = [50, 80];
      currentX = leftCol;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      // Evaluator Name
      pdf.text('Evaluator Name:', currentX, yPos);
      pdf.setLineWidth(0.3);
      pdf.line(currentX + evalColWidths[0], yPos - 1, currentX + evalColWidths[0] + evalColWidths[1], yPos - 1);
      yPos += 10;

      // Date of Evaluation
      pdf.text('Date of Evaluation:', currentX, yPos);
      pdf.line(currentX + evalColWidths[0], yPos - 1, currentX + evalColWidths[0] + evalColWidths[1], yPos - 1);
      yPos += 10;

      // Signature
      pdf.text('Evaluator Signature:', currentX, yPos);
      pdf.line(currentX + evalColWidths[0], yPos - 1, currentX + evalColWidths[0] + evalColWidths[1], yPos - 1);
      yPos += 15;

      const rubricRemarksHeight = 40;
      pdf.setLineWidth(0.3);
      pdf.rect(leftCol, yPos, pageWidth - 2 * margin, rubricRemarksHeight);
      
      // Add footer to each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        const footerText = `Assignment Portal - ${ASSIGNMENT_DETAILS.courseCode} | Page ${i} of ${totalPages}`;
        pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
      
      // Save PDF
      pdf.save(`${ASSIGNMENT_DETAILS.courseCode}_Assignment1_${formData.name}_${formData.rollNo}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      // Reset the form after PDF generation (whether successful or not)
      resetForm();
      
      // Reset the state variables
      setIsGeneratingPdf(false);
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      rollNo: '',
      registrationNo: '',
      department: '',
      submissionDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });
    setQuestions(QUESTIONS.map(q => ({
      id: q.id,
      code: '',
      outputImage: null,
      outputImagePreview: null,
      justification: ''
    })));
    setErrors({});
    
    // Reset the form element itself if the ref is available
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Assignment Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="relative">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-800 to-blue-900"></div>
            
            <div className="p-6 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="bg-white p-3 rounded-lg shadow-md border border-blue-100">
                  <img 
                    src={logo} 
                    alt="KiTE Logo" 
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div className="pl-2">
                  <h2 className="text-2xl font-bold text-blue-900 tracking-tight">{ASSIGNMENT_DETAILS.title}</h2>
                  <p className="text-blue-700 text-lg font-medium">{ASSIGNMENT_DETAILS.courseTitle}</p>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-gray-600 text-sm">Course Code: <span className="font-mono font-bold">{ASSIGNMENT_DETAILS.courseCode}</span></span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-900">{ASSIGNMENT_DETAILS.questionsCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Marks</p>
                  <p className="text-2xl font-bold text-green-600">{ASSIGNMENT_DETAILS.totalMarks}</p>
                </div>
                <a href="https://ips-community.netlify.app/" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-lg shadow-md border border-blue-100 transition-all hover:shadow-lg hover:border-blue-200 hover:scale-105">
                  <img 
                    src={techCommunityLogo} 
                    alt="Tech Community Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-sky-900 to-blue-700 px-8 py-6">
            <h1 className="text-white text-3xl font-bold tracking-tight">Python Programming Assignment Submission</h1>
            <p className="text-blue-50 text-sm mt-1">Complete all 5 questions to generate your assignment PDF</p>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="px-8 py-8 space-y-8 bg-gradient-to-br from-blue-50 to-sky-50">
            {/* Instructions */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-amber-700 font-bold mb-2">Assignment Instructions:</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Complete <strong>all 5 questions</strong> to unlock PDF generation</li>
                    <li>• Write Python code for each question</li>
                    <li>• Upload output screenshots as images</li>
                    <li>• Provide justification for your approach</li>
                    <li>• Each question carries <strong>8 marks</strong> (Total: 40 marks)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Student Details Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onCopy={preventCopyPaste}
                    onPaste={preventCopyPaste}
                    className={`block w-full px-4 py-3 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Roll Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    onCopy={preventCopyPaste}
                    onPaste={preventCopyPaste}
                    className={`block w-full px-4 py-3 border ${errors.rollNo ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    placeholder="Enter your roll number"
                    required
                  />
                  {errors.rollNo && (
                    <p className="mt-2 text-sm text-red-600">{errors.rollNo}</p>
                  )}
                </div>

                {/* Registration Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleInputChange}
                    onCopy={preventCopyPaste}
                    onPaste={preventCopyPaste}
                    className={`block w-full px-4 py-3 border ${errors.registrationNo ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    placeholder="Enter your registration number"
                    required
                  />
                  {errors.registrationNo && (
                    <p className="mt-2 text-sm text-red-600">{errors.registrationNo}</p>
                  )}
                </div>

                {/* Department */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 border ${errors.department ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white`}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="CSE A">CSE A</option>
                    <option value="CSE B">CSE B</option>
                    <option value="AIDS A">AIDS A</option>
                    <option value="AIDS B">AIDS B</option>
                    <option value="ECE A">ECE A</option>
                    <option value="ECE B">ECE B</option>
                    <option value="CYS">CYS</option>
                    <option value="AIML A">AIML A</option>
                    <option value="AIML B">AIML B</option>
                    <option value="MECH">MECH</option>
                    <option value="CSBS">CSBS</option>
                    <option value="RA">RA</option>
                    <option value="IT A">IT A</option>
                    <option value="IT B">IT B</option>
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                {/* Submission Date - Read Only */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Date
                  </label>
                  <input
                    type="text"
                    value={formData.submissionDate}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    readOnly
                  />
                  <p className="mt-1 text-xs text-gray-500">Auto-generated current date</p>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            {QUESTIONS.map((questionData, index) => {
              const question = questions[index];
              
              // Individual dropzone for this question to prevent re-rendering issues
              const onDrop = useCallback((acceptedFiles) => {
                if (acceptedFiles.length > 0) {
                  handleImageUpload(question.id, acceptedFiles[0]);
                }
              }, [question.id, handleImageUpload]);

              const { getRootProps, getInputProps, isDragActive } = useDropzone({
                onDrop,
                accept: {
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
                },
                multiple: false
              });
              
              return (
                <div key={`question-${question.id}`} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <span className="bg-blue-600 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        {question.id}
                      </span>
                      {questionData.title}
                      <span className="ml-2 text-sm font-normal text-green-600">({ASSIGNMENT_DETAILS.marksPerQuestion} marks)</span>
                    </h3>
                  </div>

                  {/* Question Description */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700 mb-2"><strong>Problem Description:</strong></p>
                    <p className="text-sm text-gray-700 mb-3">{questionData.description}</p>
                    <p className="text-sm text-blue-800"><strong>Core Concept:</strong> {questionData.concept}</p>
                    {questionData.input && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 font-semibold">Input Given:</p>
                        <p className="text-sm text-gray-600">{questionData.input}</p>
                      </div>
                    )}
                    {questionData.output && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 font-semibold">Expected Output:</p>
                        <p className="text-sm text-gray-600">{questionData.output}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Section */}
                    <div className="space-y-4">
                      {/* Python Code Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Python Code
                        </label>
                        <div className="relative">
                          <textarea
                            value={question.code}
                            onChange={(e) => handleQuestionChange(question.id, 'code', e.target.value)}
                            onCopy={preventCopyPaste}
                            onPaste={preventCopyPaste}
                            rows="12"
                            className={`block w-full px-4 py-3 border ${errors[`code${question.id}`] ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 font-mono text-sm bg-gray-50`}
                            placeholder="# Write your Python code here..."
                            required
                          />
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              Python
                            </span>
                          </div>
                        </div>
                        {errors[`code${question.id}`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`code${question.id}`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Output and Justification Section */}
                    <div className="space-y-4">
                      {/* Output Screenshot Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Output Screenshot
                        </label>
                        <div
                          {...getRootProps()}
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isDragActive
                              ? 'border-blue-400 bg-blue-50'
                              : errors[`output${question.id}`]
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <input {...getInputProps()} />
                          
                          {question.outputImagePreview ? (
                            <div className="space-y-3">
                              <img
                                src={question.outputImagePreview}
                                alt="Output preview"
                                className="max-w-full max-h-40 mx-auto rounded-lg shadow-sm"
                              />
                              <p className="text-sm text-green-600 font-medium">✓ Screenshot uploaded</p>
                              <p className="text-xs text-gray-500">Click or drag to replace</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Upload output screenshot</p>
                                <p className="text-xs text-gray-500">Drag & drop or click to select</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {errors[`output${question.id}`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`output${question.id}`]}</p>
                        )}
                      </div>

                      {/* Justification */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Justification / Explanation
                        </label>
                        <textarea
                          value={question.justification}
                          onChange={(e) => handleQuestionChange(question.id, 'justification', e.target.value)}
                          onCopy={preventCopyPaste}
                          onPaste={preventCopyPaste}
                          rows="6"
                          className={`block w-full px-4 py-3 border ${errors[`justification${question.id}`] ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                          placeholder="Explain your approach, logic, and methodology..."
                          required
                        />
                        {errors[`justification${question.id}`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`justification${question.id}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            
            {/* Form Progress and Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              {/* Progress Indicator */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Submission Progress</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const isComplete = question.code.trim() && question.outputImage && question.justification.trim();
                    return (
                      <div key={question.id} className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-1 ${
                          isComplete 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isComplete ? '✓' : index + 1}
                        </div>
                        <p className="text-xs text-gray-600">Q{index + 1}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Questions Completed</span>
                    <span className="font-semibold text-blue-600">
                      {questions.filter(q => q.code.trim() && q.outputImage && q.justification.trim()).length} / {ASSIGNMENT_DETAILS.questionsCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(questions.filter(q => q.code.trim() && q.outputImage && q.justification.trim()).length / ASSIGNMENT_DETAILS.questionsCount) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Form Functions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting || isGeneratingPdf}
                  className="px-5 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Form
                  </div>
                </button>
                
                <div className="flex items-center space-x-4">
                  {!isFormComplete() && (
                    <p className="text-sm text-amber-600 font-medium">
                      Complete all questions to generate PDF
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!isFormComplete() || isSubmitting || isGeneratingPdf}
                    className={`px-6 py-3 rounded-lg shadow-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isFormComplete() 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isGeneratingPdf ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Assignment PDF...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Generate Assignment PDF
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Simple Footer - Matching Header Style */}
      <footer className="mt-12">\
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Logo */}
              <div className="flex items-center mb-4 md:mb-0">
                <span className="text-blue-600 font-mono text-xl mr-2">&lt;/&gt;</span>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">IPS TECH</h3>
              </div>
            
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {/* GitHub */}
                <a href="https://github.com/Kite-IPS" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                
                {/* LinkedIn */}
                <a href="https://lnkd.in/gZdPmjSB" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a href="https://www.instagram.com/ips_tech.community?igsh=MXNkdndoNzV6YWM3" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
                {/* Gmail */}
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ipstechcommunity@kgkite.ac.in" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-600 text-sm mb-4 md:mb-0">
                  © {new Date().getFullYear()} IPS Tech Community. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm">
                  Made with <span className="text-blue-600">❤</span> by IPS Tech
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Template;