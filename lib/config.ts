export const appConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? '',
  contractsUrl: process.env.NEXT_PUBLIC_CONTRACTS_URL ?? 'https://contracts.devya-solutions.com',
  tasksUrl: process.env.NEXT_PUBLIC_TASKS_URL ?? 'https://tasks.devya-solutions.com',
  salesUrl: process.env.NEXT_PUBLIC_SALES_URL ?? 'https://sales.devya-solutions.com',
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Devya Solutions',
  companyUrl: process.env.NEXT_PUBLIC_COMPANY_URL ?? 'https://www.devya.dev',
};
