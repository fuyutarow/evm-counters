/**
 * Sui Move型からTypeScript型を推論するユーティリティ
 * SuiMoveNormalizedModulesをABIとして扱い、viemライクな型推論を実現
 */

import {
  type SuiMoveNormalizedField,
  type SuiMoveNormalizedStruct,
  type SuiMoveNormalizedType,
} from "@mysten/sui/client";

/**
 * Move型をTypeScript型に変換する型ユーティリティ
 */
export type MoveTypeToTypeScript<T extends SuiMoveNormalizedType> = T extends "Bool"
  ? boolean
  : T extends "U8" | "U16" | "U32"
    ? number
    : T extends "U64" | "U128" | "U256"
      ? string
      : T extends "Address"
        ? string
        : T extends "Signer"
          ? never
          : T extends { Vector: infer U extends SuiMoveNormalizedType }
            ? MoveTypeToTypeScript<U>[]
            : T extends { Reference: infer U extends SuiMoveNormalizedType }
              ? MoveTypeToTypeScript<U>
              : T extends { MutableReference: infer U extends SuiMoveNormalizedType }
                ? MoveTypeToTypeScript<U>
                : T extends { TypeParameter: number }
                  ? unknown
                  : T extends { Struct: unknown }
                    ? unknown
                    : // ネストした構造体は一旦unknown
                      unknown;

/**
 * Move構造体のフィールドから型を推論
 */
export type InferFieldTypes<T extends readonly SuiMoveNormalizedField[]> = {
  [K in T[number] as K["name"]]: MoveTypeToTypeScript<K["type"]>;
};

/**
 * Move構造体からTypeScript型を推論
 */
export type InferStructType<T extends SuiMoveNormalizedStruct> = InferFieldTypes<T["fields"]>;

/**
 * Moduleから特定の構造体型を取得
 */
export type GetStructType<
  TModules,
  TModuleName extends keyof TModules,
  TStructName extends string,
> = TModules[TModuleName] extends { structs: infer S }
  ? S extends Record<TStructName, infer T>
    ? T extends SuiMoveNormalizedStruct
      ? InferStructType<T>
      : never
    : never
  : never;

/**
 * Package全体の構造体型を推論
 */
export type InferPackageTypes<T> = {
  [ModuleName in keyof T]: T[ModuleName] extends { structs: infer S }
    ? S extends Record<string, SuiMoveNormalizedStruct>
      ? {
          [StructName in keyof S]: S[StructName] extends SuiMoveNormalizedStruct
            ? InferStructType<S[StructName]>
            : never;
        }
      : never
    : never;
};

/**
 * 型ガード関数の自動生成ユーティリティ
 */
export function createTypeGuard<T extends Record<string, unknown>>(
  expectedFields: string[],
  stringFields: string[] = [],
) {
  return (data: unknown): data is T => {
    if (!data || typeof data !== "object") return false;
    const obj = data as Record<string, unknown>;

    // 必須フィールドの存在確認
    for (const field of expectedFields) {
      if (!(field in obj)) return false;
    }

    // string型フィールドの型確認
    for (const field of stringFields) {
      if (typeof obj[field] !== "string") return false;
    }

    return true;
  };
}

/**
 * 型推論のヘルパー型
 *
 * 使用例:
 * ```typescript
 * const modules = await client.getNormalizedMoveModulesByPackage({...});
 *
 * // 特定の構造体型を取得
 * type Counter = GetStructType<typeof modules, "counter", "Counter">;
 *
 * // Package全体の型を取得
 * type AllTypes = InferPackageTypes<typeof modules>;
 * type Counter2 = AllTypes["counter"]["Counter"];
 *
 * // 型ガード関数の自動生成
 * const isCounter = createTypeGuard<Counter>(["id", "owner", "value"], ["owner", "value"]);
 * ```
 */
