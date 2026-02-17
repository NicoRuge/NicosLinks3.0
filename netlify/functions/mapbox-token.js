exports.handler = async () => {
    const token = process.env.MAPBOX_PUBLIC_TOKEN;

    if (!token) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "MAPBOX_PUBLIC_TOKEN is not configured"
            })
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300"
        },
        body: JSON.stringify({ token })
    };
};
