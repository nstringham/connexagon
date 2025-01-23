export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			countries: {
				Row: {
					id: number;
					name: string;
				};
				Insert: {
					id?: never;
					name: string;
				};
				Update: {
					id?: never;
					name?: string;
				};
				Relationships: [];
			};
			games: {
				Row: {
					board: Database["public"]["CompositeTypes"]["cell"][] | null;
					completed_at: string | null;
					created_at: string;
					host_user_id: string;
					id: string;
					started_at: string | null;
					turn: number | null;
					winner_player_number: number | null;
				};
				Insert: {
					board?: Database["public"]["CompositeTypes"]["cell"][] | null;
					completed_at?: string | null;
					created_at?: string;
					host_user_id: string;
					id?: string;
					started_at?: string | null;
					turn?: number | null;
					winner_player_number?: number | null;
				};
				Update: {
					board?: Database["public"]["CompositeTypes"]["cell"][] | null;
					completed_at?: string | null;
					created_at?: string;
					host_user_id?: string;
					id?: string;
					started_at?: string | null;
					turn?: number | null;
					winner_player_number?: number | null;
				};
				Relationships: [];
			};
			notes: {
				Row: {
					created_at: string;
					id: number;
					note: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: never;
					note: string;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					id?: never;
					note?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			players: {
				Row: {
					color: number;
					created_at: string;
					game_id: string;
					player_number: number | null;
					user_id: string;
				};
				Insert: {
					color: number;
					created_at?: string;
					game_id: string;
					player_number?: number | null;
					user_id: string;
				};
				Update: {
					color?: number;
					created_at?: string;
					game_id?: string;
					player_number?: number | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "players_game_id_fkey";
						columns: ["game_id"];
						isOneToOne: false;
						referencedRelation: "games";
						referencedColumns: ["id"];
					},
				];
			};
			profiles: {
				Row: {
					id: string;
					name: string | null;
				};
				Insert: {
					id: string;
					name?: string | null;
				};
				Update: {
					id?: string;
					name?: string | null;
				};
				Relationships: [];
			};
			turns: {
				Row: {
					cells: number[];
					created_at: string;
					game_id: string;
					turn_number: number;
				};
				Insert: {
					cells: number[];
					created_at?: string;
					game_id: string;
					turn_number: number;
				};
				Update: {
					cells?: number[];
					created_at?: string;
					game_id?: string;
					turn_number?: number;
				};
				Relationships: [
					{
						foreignKeyName: "turns_game_id_fkey";
						columns: ["game_id"];
						isOneToOne: false;
						referencedRelation: "games";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			_xid_machine_id: {
				Args: Record<PropertyKey, never>;
				Returns: number;
			};
			xid: {
				Args: {
					_at?: string;
				};
				Returns: unknown;
			};
			xid_counter: {
				Args: {
					_xid: unknown;
				};
				Returns: number;
			};
			xid_decode: {
				Args: {
					_xid: unknown;
				};
				Returns: number[];
			};
			xid_encode: {
				Args: {
					_id: number[];
				};
				Returns: unknown;
			};
			xid_machine: {
				Args: {
					_xid: unknown;
				};
				Returns: number[];
			};
			xid_pid: {
				Args: {
					_xid: unknown;
				};
				Returns: number;
			};
			xid_time: {
				Args: {
					_xid: unknown;
				};
				Returns: string;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			cell: {
				tower: boolean | null;
				player_number: number | null;
			};
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
		? PublicSchema["Enums"][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
		? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;
