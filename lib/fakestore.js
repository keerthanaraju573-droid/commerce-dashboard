const FAKESTORE_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://fakestoreapi.com";

async function parseBody(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fakestoreRequest(path, options = {}) {
  const url = `${FAKESTORE_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });

    const data = await parseBody(response);

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: null,
      networkError: true,
    };
  }
}

export function normalizeUser(user) {
  return {
    id: user?.id,
    email: user?.email || "",
    username: user?.username || "",
    password: user?.password || "",
    name: {
      firstname: user?.name?.firstname || "",
      lastname: user?.name?.lastname || "",
    },
    address: {
      city: user?.address?.city || "",
      street: user?.address?.street || "",
      number: user?.address?.number || "",
      zipcode: user?.address?.zipcode || "",
      geolocation: {
        lat: user?.address?.geolocation?.lat || "",
        long: user?.address?.geolocation?.long || "",
      },
    },
    phone: user?.phone || "",
  };
}

export function normalizeProduct(product) {
  return {
    id: product?.id,
    title: product?.title || "",
    price: Number(product?.price) || 0,
    description: product?.description || "",
    category: product?.category || "",
    image: product?.image || "",
    rating: {
      rate: Number(product?.rating?.rate) || 0,
      count: Number(product?.rating?.count) || 0,
    },
  };
}
