addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const { searchParams } = new URL(request.url);

    // Check for Authorization header
    const authorizationHeader = request.headers.get("Authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith('USER')) {
        return new Response('Unauthorized', { status: 401 });
    }
    const userId = authorizationHeader.slice(4);

    // Rate limit visit
    const rateLimitKey = `rate_limit_${userId}`;
    const rateLimit = await RATE_LIMIT_STORAGE.get(rateLimitKey) || 0;
    if (rateLimit >= 4) {
        return new Response('Rate Limit Exceeded', { status: 429 });
    }
    await RATE_LIMIT_STORAGE.put(rateLimitKey, rateLimit + 1, { expirationTtl: 60 });

    // Incremental visit count
    const visitCountKey = `visit_count_${userId}`;
    const visitCount = await env.VISIT_COUNT_STORAGE.get(visitCountKey) || 0;
    await VISIT_COUNT_STORAGE.put(visitCountKey, visitCount + 1, { expirationTtl: 60 });

    // Stream sequence number
    const streamSeqKey = `stream_seq_${userId}`;
    const streamSeq = await STREAM_SEQ_STORAGE.get(streamSeqKey) || 0;

    const isStream = searchParams.get('stream') === 'true';
    if (isStream) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Build JSON response
    const responsePayload = {
        message: `Welcome USER_${userId}, this is your visit #${visitCount}`,
        group: hashUserIdToGroup(userId),
        rate_limit_left: 4 - rateLimit,
        stream_seq: isStream ? streamSeq : 0,
    };

    if (isStream) {
        await STREAM_SEQ_STORAGE.put(streamSeqKey, streamSeq + 1, { expirationTtl: 60 });
    }

    return new Response(JSON.stringify(responsePayload), { headers: { 'Content-Type': 'application/json' } });
}

// Hash user ID to a group (1-10)
function hashUserIdToGroup(userId) {
    return (userId % 10) + 1;
}
