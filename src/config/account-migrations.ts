// -- Account Migration Types ---------------------------------------------------

export interface AccountMigration {
  from: string;
  to: string;
  migratedAt?: string;
}

// -- Migration Registry --------------------------------------------------------

/**
 * Registry of account name migrations.
 * When an artist/account gets renamed, add an entry here.
 * The transform layer will automatically map old names to new names
 * and aggregate request counts.
 */
export const ACCOUNT_MIGRATIONS: AccountMigration[] = [
  {
    from: "Halsey",
    to: "Khalid",
    migratedAt: "2024-11",
  },
];

// -- Migration Utilities -------------------------------------------------------

const migrationMap = new Map(
  ACCOUNT_MIGRATIONS.map((m) => [m.from.toLowerCase(), m])
);

export function getMigration(name: string): AccountMigration | undefined {
  return migrationMap.get(name.toLowerCase());
}

export function getCanonicalName(name: string): string {
  const migration = getMigration(name);
  return migration ? migration.to : name;
}

export function getFormerNames(currentName: string): string[] {
  return ACCOUNT_MIGRATIONS.filter(
    (m) => m.to.toLowerCase() === currentName.toLowerCase()
  ).map((m) => m.from);
}
