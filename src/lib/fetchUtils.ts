export async function parseJSONResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch (err) {
      const text = await res.text();
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
  }

  // If the response is not JSON, try to parse text and give a helpful error
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Expected JSON but received non-JSON response: ${text.slice(0, 200)}`);
  }
}
