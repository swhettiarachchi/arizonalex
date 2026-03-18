const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alex@arizonalex.com', password: 'password123' })
        });
        const data = await res.json();
        console.log('Login Response:', data.success ? 'Success' : data.message);

        const pollRes = await fetch('http://localhost:5000/api/polls');
        const pollData = await pollRes.json();
        const firstPollId = pollData.polls[0]._id;

        const voteRes = await fetch(`http://localhost:5000/api/polls/${firstPollId}/vote`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${data.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionIndex: 0 })
        });
        const voteData = await voteRes.json();
        console.log('Vote Response:', voteData.success ? 'Success' : voteData.message);

    } catch (e) {
        console.error(e);
    }
};

test();
