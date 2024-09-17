const PhonePattern = /^0[35789][0-9]{8}$/;

const EmailPattern =
  /^(?!.*[.]{2,})[a-zA-Z0-9.%]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export { PhonePattern, EmailPattern, corsOptions };
