console.log('create_labels.js loaded');

async function createCommentLabels() {
    const labels = [
        {
            name: 'comment',
            description: 'User comments on posts',
            color: '0366d6'
        },
        {
            name: 'comment:approved',
            description: 'Approved comments',
            color: '238636'  // green
        },
        {
            name: 'comment:pending',
            description: 'Comments waiting for approval',
            color: 'ffb347'  // orange
        },
        {
            name: 'comment:spam',
            description: 'Spam comments',
            color: 'dc3545'  // red
        },
        {
            name: 'needs-notification',
            description: 'Requires email notification',
            color: '6f42c1'  // purple
        }
    ];

    for (const label of labels) {
        try {
            console.log(`Creating label: ${label.name}...`);
            const response = await fetch('https://api.github.com/repos/Risch315815/Animal_Hospital__Dental_Department/labels', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(label)
            });
            
            if (response.ok) {
                console.log(`✓ Label "${label.name}" created successfully`);
            } else {
                console.error(`✗ Failed to create label "${label.name}"`);
            }
        } catch (error) {
            console.error(`Error creating label "${label.name}":`, error);
        }
    }
}

async function testLabels() {
    console.log('🔍 Testing labels...');
    // ... rest of testLabels function ...
}

async function runTests() {
    console.log('🚀 Starting tests...');
    
    try {
        console.log('\n1️⃣ Creating labels...');
        await createCommentLabels();
        
        console.log('\n2️⃣ Testing label functionality...');
        await testLabels();
        
        console.log('\n✨ All tests completed!');
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Make functions available globally
window.testLabels = testLabels;
window.createCommentLabels = createCommentLabels;
window.runTests = runTests; 