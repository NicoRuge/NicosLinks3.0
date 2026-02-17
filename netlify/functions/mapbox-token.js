exports.handler = async () => {
    const token =
        process.env.MAPBOX_PUBLIC_TOKEN ||
        process.env.MAPBOX_TOKEN ||
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        process.env.VITE_MAPBOX_TOKEN;

    if (!token) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Mapbox token is not configured. Set MAPBOX_PUBLIC_TOKEN (or MAPBOX_TOKEN)."
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
