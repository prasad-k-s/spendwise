// Types for the Supabase database, matching supabase/migrations.
// Update this file whenever a migration changes a table.
// (Later we can generate it automatically with `supabase gen types`.)

export type CategoryType = "expense" | "income";
export type TransactionType = CategoryType;
export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer" | "other";
export type GroupRole = "owner" | "member";

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
      groups: {
        Row: {
          id: string;
          name: string;
          currency: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        /** Create groups with the create_group() function, not a direct insert. */
        Insert: {
          id?: string;
          name: string;
          currency?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          currency?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: GroupRole;
          joined_at: string;
        };
        /** Members join through create_group() or accept_group_invite(), not a direct insert. */
        Insert: {
          group_id: string;
          user_id: string;
          role?: GroupRole;
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: GroupRole;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_invites: {
        Row: {
          id: string;
          group_id: string;
          token: string;
          created_by: string;
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          token?: string;
          created_by?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          token?: string;
          created_by?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_group: {
        Args: { p_name: string; p_currency?: string };
        Returns: string;
      };
      get_invite_preview: {
        Args: { p_token: string };
        Returns: {
          group_id: string;
          group_name: string;
          member_count: number;
          already_member: boolean;
        }[];
      };
      accept_group_invite: {
        Args: { p_token: string };
        Returns: string;
      };
      is_group_member: {
        Args: { p_group_id: string };
        Returns: boolean;
      };
      is_group_owner: {
        Args: { p_group_id: string };
        Returns: boolean;
      };
      shares_group_with: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];

export type Profile = PublicTables["profiles"]["Row"];
export type Category = PublicTables["categories"]["Row"];
export type Transaction = PublicTables["transactions"]["Row"];
export type TransactionInsert = PublicTables["transactions"]["Insert"];
export type Group = PublicTables["groups"]["Row"];
export type GroupMember = PublicTables["group_members"]["Row"];
export type GroupInvite = PublicTables["group_invites"]["Row"];
