"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGenerator = void 0;
const DateUtils_1 = require("./DateUtils");
class PdfGenerator {
    constructor() {
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            throw new Error('PDF library (jsPDF) not loaded or unavailable');
        }
    }
    generateTasksPdf(tasks) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            // Set up document title and header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(51, 51, 153);
            doc.text('TaskMaster Pro - Task List', 14, 22);
            // Add timestamp
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            // Add tasks section headers
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            let y = 40;
            const pendingTasks = tasks.filter(t => !t.completed);
            const completedTasks = tasks.filter(t => t.completed);
            // Pending Tasks
            if (pendingTasks.length > 0) {
                doc.setTextColor(204, 0, 0);
                doc.text('Pending Tasks', 14, y);
                y += 8;
                doc.setTextColor(0, 0, 0);
                y = this.addTasksToDocument(doc, pendingTasks, y);
                y += 10;
            }
            // Completed Tasks
            if (completedTasks.length > 0) {
                doc.setTextColor(0, 128, 0);
                doc.text('Completed Tasks', 14, y);
                y += 8;
                doc.setTextColor(0, 0, 0);
                y = this.addTasksToDocument(doc, completedTasks, y);
            }
            doc.save('taskmaster-tasks.pdf');
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
    addTasksToDocument(doc, tasks, startY) {
        let y = startY;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        tasks.forEach((task, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            // Task title with priority indicator
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            // Set color based on priority
            switch (task.priority) {
                case "high":
                    doc.setTextColor(204, 0, 0);
                    break;
                case "medium":
                    doc.setTextColor(204, 102, 0);
                    break;
                case "low":
                    doc.setTextColor(0, 128, 0);
                    break;
                default:
                    doc.setTextColor(0, 0, 0);
            }
            doc.text(`${index + 1}. ${task.title}`, 14, y);
            y += 6;
            // Task details
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(`• Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`, 18, y);
            y += 5;
            doc.text(`• Deadline: ${DateUtils_1.DateUtils.formatDateForDisplay(task.deadline)}`, 18, y);
            y += 5;
            if (task.description) {
                doc.text(`• Description:`, 18, y);
                y += 5;
                const descLines = doc.splitTextToSize(task.description, 170);
                doc.text(descLines, 22, y);
                y += (descLines.length * 5);
            }
            y += 8;
        });
        return y;
    }
}
exports.PdfGenerator = PdfGenerator;
//# sourceMappingURL=PdfGenerator.js.map