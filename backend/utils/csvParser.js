import fs from 'fs';
import csv from 'fast-csv';
import { validateAlumniRecord } from './validators.js';

export const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        let rowNumber = 0;
        
        fs.createReadStream(filePath)
            .pipe(csv.parse({ 
                headers: true, 
                trim: true,
                skipEmptyLines: true,
                ignoreEmpty: true
            }))
            .on('error', error => reject(error))
            .on('data', (row) => {
                rowNumber++;
                
                // Validate the row
                const validation = validateAlumniRecord(row);
                
                if (validation.isValid) {
                    results.push(validation.data);
                } else {
                    errors.push({
                        row: rowNumber,
                        errors: validation.errors,
                        data: row
                    });
                }
            })
            .on('end', () => {
                // Clean up the uploaded file
                try {
                    fs.unlinkSync(filePath);
                } catch (error) {
                    console.warn('Could not delete uploaded file:', error.message);
                }
                
                if (errors.length > 0) {
                    console.warn(`CSV parsing completed with ${errors.length} errors:`, errors);
                }
                
                resolve({
                    data: results,
                    errors: errors,
                    totalRows: rowNumber,
                    validRows: results.length,
                    invalidRows: errors.length
                });
            });
    });
};

// Helper function to clean and normalize CSV data
export const cleanCSVData = (data) => {
    return {
        name: data.name?.trim(),
        email: data.email?.trim().toLowerCase(),
        course: data.course?.trim(),
        department: data.department?.trim(),
        batch: data.batch ? parseInt(data.batch) : null,
        company: data.company?.trim(),
        position: data.position?.trim(),
        domain: data.domain?.trim(),
        experience: data.experience ? parseInt(data.experience) : null,
        location: data.location?.trim(),
        bio: data.bio?.trim() || ''
    };
};