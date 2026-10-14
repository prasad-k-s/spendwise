// Types for the Supabase database, matching supabase/migrations.
// Update this file whenever a migration changes a table.
// (Later we can generate it automatically with `supabase gen types`.)

export type CategoryType = "expense" | "income";
export type TransactionType = CategoryType;
export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer" | "other";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: CategoryType;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: CategoryType;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: CategoryType;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          /** Postgres numeric comes back as a number from supabase-js. */
          amount: number;
          category_id: string | null;
          /** "YYYY-MM-DD" */
          occurred_on: string;
          note: string | null;
          payment_method: PaymentMethod;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          /** Defaults to the signed-in user. */
          user_id?: string;
          type: TransactionType;
          amount: number;
          category_id?: string | null;
          occurred_on?: string;
          note?: string | null;
          payment_method?: PaymentMethod;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: TransactionType;
          amount?: number;
          category_id?: string | null;
          occurred_on?: string;
          note?: string | null;
          payment_method?: PaymentMethod;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];

export type Profile = PublicTables["profiles"]["Row"];
export type Category = PublicTables["categories"]["Row"];
export type Transaction = PublicTables["transactions"]["Row"];
export type TransactionInsert = PublicTables["transactions"]["Insert"];
