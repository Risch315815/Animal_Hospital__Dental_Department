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
            const response = await fetch('https://api.github.com/repos/Risch315815/Risch315815.github.io/labels', {
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
    
    // 1. Test getting all labels
    try {
        const response = await fetch('https://api.github.com/repos/Risch315815/Risch315815.github.io/labels', {
            headers: {
                'Authorization': `token ${CONFIG.GITHUB_TOKEN}`
            }
        });
        const labels = await response.json();
        console.log('📋 Existing labels:', labels.map(l => l.name));
        
        // Check for required labels
        const requiredLabels = [
            'comment',
            'comment:approved',
            'comment:pending',
            'comment:spam',
            'needs-notification'
        ];
        
        const missingLabels = requiredLabels.filter(
            required => !labels.some(l => l.name === required)
        );
        
        if (missingLabels.length > 0) {
            console.error('❌ Missing labels:', missingLabels);
        } else {
            console.log('✅ All required labels exist');
        }

        // 2. Test creating a test comment
        console.log('📝 Testing comment creation...');
        const commentResponse = await fetch('https://api.github.com/repos/Risch315815/Risch315815.github.io/issues', {
            method: 'POST',
            headers: {
                'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Test Comment',
                body: 'This is a test comment. Please delete after testing.',
                labels: ['comment:pending', 'needs-notification']
            })
        });

        if (commentResponse.ok) {
            const issue = await commentResponse.json();
            console.log('✅ Test comment created:', issue.html_url);
            
            // 3. Test modifying labels
            console.log('🏷️ Testing label modification...');
            const updateResponse = await fetch(
                `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issue.number}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        labels: ['comment:approved']
                    })
                }
            );
            
            if (updateResponse.ok) {
                console.log('✅ Labels modified successfully');
            } else {
                console.error('❌ Failed to modify labels');
            }

            // 4. Clean up - delete test comment
            console.log('🧹 Cleaning up test comment...');
            const deleteResponse = await fetch(
                `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issue.number}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        state: 'closed'
                    })
                }
            );
            
            if (deleteResponse.ok) {
                console.log('✅ Test comment cleaned up');
            } else {
                console.error('❌ Failed to clean up test comment');
            }
        } else {
            console.error('❌ Failed to create test comment');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
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

// Make all functions available globally
window.testLabels = testLabels;
window.createCommentLabels = createCommentLabels;
window.runTests = runTests; 