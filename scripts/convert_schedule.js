// type in terminal: node scripts/convert_schedule.js

const fs = require('fs');
const path = require('path');
const defaultPath = "./data/Schedule_data";

function processDirectory(directoryPath) {
    try {
        // Read all files in directory
        const files = fs.readdirSync(directoryPath);
        
        // Filter for CSV files with YYYYMMDD format
        const csvFiles = files.filter(file => {
            return file.match(/^\d{8}\.csv$/); // Matches YYYYMMDD.csv
        });
        
        if (csvFiles.length === 0) {
            console.log('No matching CSV files found');
            return;
        }
        
        console.log(`Found ${csvFiles.length} CSV files to process`);
        
        // Process each matching file
        csvFiles.forEach(file => {
            const inputPath = path.join(directoryPath, file);
            console.log(`Processing ${file}...`);
            convertCSVToJSON(inputPath);
        });
        
    } catch (error) {
        console.error('Failed to process directory:', error);
    }
}

function convertCSVToJSON(inputFile) {
    try {
        // Read CSV file
        const csvContent = fs.readFileSync(inputFile, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        // Get header row for dates
        const dateRow = lines[1].split(',');
        const dates = dateRow.slice(3);
        
        // Initialize schedule object
        const schedule = {
            "2025": {
                "01": {}
            }
        };
        
        // Process each line starting from data rows
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].split(',');
            if (line.length < 4) continue;
            
            const doctorName = line[1];
            const timeSlot = line[2].toLowerCase();
            const doctorId = getDoctorId(doctorName);
            
            if (!doctorId) continue;
            
            // Process each date for this doctor and timeslot
            line.slice(3).forEach((value, index) => {
                const date = dates[index].split('/')[1];
                
                if (!schedule["2025"]["01"][date]) {
                    schedule["2025"]["01"][date] = {};
                }
                if (!schedule["2025"]["01"][date][doctorId]) {
                    schedule["2025"]["01"][date][doctorId] = {
                        morning: 'unavailable',
                        afternoon: 'unavailable',
                        evening: 'unavailable'
                    };
                }
                
                const status = value.trim() === 'V' ? 'available' :
                             value.trim() === '+' ? 'full' :
                             'unavailable';
                             
                schedule["2025"]["01"][date][doctorId][timeSlot] = status;
            });
        };
        
        // Write JSON file
        const outputFile = inputFile.replace('.csv', '.json');
        fs.writeFileSync(outputFile, JSON.stringify(schedule, null, 2));
        console.log(`Successfully converted ${path.basename(inputFile)} to ${path.basename(outputFile)}`);
        
    } catch (error) {
        console.error(`Failed to convert file ${path.basename(inputFile)}:`, error);
    }
}

function getDoctorId(doctorName) {
    const doctorNameToId = {
        'OralPathAnteater': 1,
        'Extractosaurus': 2,
        'Scaling Kitty': 3,
        'ProsthoWolf': 4,
        'PedoRabbit': 5,
        'Lavisheep': 6,
        'Captain Frontal Lobotomy': 7
    };
    return doctorNameToId[doctorName];
}

// Use command line argument or default path
const inputPath = process.argv[2] || defaultPath;

// Check if path exists
if (!fs.existsSync(inputPath)) {
    console.error(`Directory not found: ${inputPath}`);
    process.exit(1);
}

// Check if path is directory or file
if (fs.statSync(inputPath).isDirectory()) {
    console.log(`Processing directory: ${inputPath}`);
    processDirectory(inputPath);
} else {
    console.log(`Processing single file: ${inputPath}`);
    convertCSVToJSON(inputPath);
} 