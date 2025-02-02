export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			games: {
				Row: {
					board: Database["public"]["CompositeTypes"]["cell"][] | null;
					completed_at: string | null;
					created_at: string;
					host_user_id: string;
					id: string;
					started_at: string | null;
					turn: number | null;
					winner: Database["public"]["Enums"]["color"] | null;
				};
				Insert: {
					board?: Database["public"]["CompositeTypes"]["cell"][] | null;
					completed_at?: string | null;
					created_at?: string;
					host_user_id: string;
					id?: string;
					started_at?: string | null;
					turn?: number | null;
					winner?: Database["public"]["Enums"]["color"] | null;
				};
				Update: {
					board?: Database["public"]["CompositeTypes"]["cell"][] | null;
					completed_at?: string | null;
					created_at?: string;
					host_user_id?: string;
					id?: string;
					started_at?: string | null;
					turn?: number | null;
					winner?: Database["public"]["Enums"]["color"] | null;
				};
				Relationships: [
					{
						foreignKeyName: "games_host_user_id_profiles_fkey";
						columns: ["host_user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["user_id"];
					},
				];
			};
			players: {
				Row: {
					color: Database["public"]["Enums"]["color"];
					created_at: string;
					game_id: string;
					turn_order: number | null;
					user_id: string;
				};
				Insert: {
					color: Database["public"]["Enums"]["color"];
					created_at?: string;
					game_id: string;
					turn_order?: number | null;
					user_id: string;
				};
				Update: {
					color?: Database["public"]["Enums"]["color"];
					created_at?: string;
					game_id?: string;
					turn_order?: number | null;
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
					{
						foreignKeyName: "players_user_id_profiles_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["user_id"];
					},
				];
			};
			profiles: {
				Row: {
					name: string;
					user_id: string;
				};
				Insert: {
					name: string;
					user_id: string;
				};
				Update: {
					name?: string;
					user_id?: string;
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
			create_game: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			join_game:
				| {
						Args: {
							game_id_to_join: string;
						};
						Returns: undefined;
				  }
				| {
						Args: {
							game_id_to_join: string;
							user_id: string;
						};
						Returns: undefined;
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
			color: "red" | "green" | "blue";
		};
		CompositeTypes: {
			cell: {
				tower: boolean | null;
				color: Database["public"]["Enums"]["color"] | null;
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
