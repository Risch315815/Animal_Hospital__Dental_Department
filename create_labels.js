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
        }
    ];

    for (const label of labels) {
        try {
            const response = await fetch('https://api.github.com/repos/Risch315815/Risch315815.github.io/labels', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(label)
            });
            
            if (response.ok) {
                console.log(`Label "${label.name}" created successfully`);
            } else {
                console.error(`Failed to create label "${label.name}"`);
            }
        } catch (error) {
            console.error(`Error creating label "${label.name}":`, error);
        }
    }
}

// Run in browser console
createCommentLabels(); 