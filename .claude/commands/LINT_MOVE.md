# Sui Move Linter スタイルガイド

## 概要
- **対象バージョン**: Sui Move 2024.beta
- **用途**: コードレビュー、自動チェック、品質保証
- **重要度レベル**: ERROR（必須） | WARNING（推奨） | INFO（提案）

---

## 1. Move 2024 必須ルール [ERROR]

### M2024-001: 構造体のpublic宣言
- **パターン**: `^struct\s+(\w+)`
- **正しい形**: `public struct $1`
- **自動修正**: 可能
- **メッセージ**: "All structs must be declared with 'public' keyword in Move 2024"
- **例**:
  ```move
  // ❌ 違反
  struct MyStruct has key { id: UID }

  // ✅ 正しい
  public struct MyStruct has key { id: UID }
  ```

### M2024-002: 変数のmutability
- **パターン**: `let\s+(\w+)\s*=.*?(?=\n).*?\1\s*=`
- **正しい形**: `let mut $1 =`
- **自動修正**: 可能
- **メッセージ**: "Variable '$1' is reassigned but not declared as 'mut'"
- **例**:
  ```move
  // ❌ 違反
  let x = 0;
  x = x + 1;

  // ✅ 正しい
  let mut x = 0;
  x = x + 1;
  ```

### M2024-003: モジュール宣言
- **パターン**: `^module\s+([\w:]+)\s*\{`
- **正しい形**: `module $1;`
- **自動修正**: 可能
- **メッセージ**: "Use semicolon instead of braces for module declaration"
- **例**:
  ```move
  // ❌ 違反
  module my_package::my_module {
      // content
  }

  // ✅ 正しい
  module my_package::my_module;
  // content
  ```

### M2024-004: 予約語の変数使用禁止
- **パターン**: `\b(enum|for|match|type)\s+(\w+)\s*[=:]`
- **自動修正**: 不可能
- **メッセージ**: "Reserved keyword '$1' cannot be used as variable name"
- **例**:
  ```move
  // ❌ 違反
  let enum = 5;
  let match = true;

  // ✅ 正しい
  let enum_type = 5;
  let match_result = true;
  ```

---

## 2. 命名規則 [ERROR]

### NAME-001: パッケージ名
- **パターン**: `name\s*=\s*"([^"]+)"`
- **チェック**: PascalCase
- **自動修正**: 不可能
- **メッセージ**: "Package name '$1' must be in PascalCase"
- **例**:
  ```toml
  # ❌ 違反
  name = "my_package"

  # ✅ 正しい
  name = "MyPackage"
  ```

### NAME-002: エラー定数
- **パターン**: `const\s+(E\w+):\s*u64`
- **チェック**: E + PascalCase
- **自動修正**: 不可能
- **メッセージ**: "Error constant '$1' must use EPascalCase format"
- **例**:
  ```move
  // ❌ 違反
  const ERROR_INVALID: u64 = 0;
  const EinvalidInput: u64 = 1;

  // ✅ 正しい
  const EInvalidInput: u64 = 0;
  const ENotAuthorized: u64 = 1;
  ```

### NAME-003: 通常定数
- **パターン**: `const\s+([A-Za-z_][A-Za-z0-9_]*):\s*\w+`
- **チェック**: UPPER_SNAKE_CASE (E始まり以外)
- **自動修正**: 不可能
- **メッセージ**: "Constant '$1' must be in UPPER_SNAKE_CASE"
- **例**:
  ```move
  // ❌ 違反
  const maxValue: u64 = 1000;
  const Max_Value: u64 = 1000;

  // ✅ 正しい
  const MAX_VALUE: u64 = 1000;
  const DEFAULT_TIMEOUT: u64 = 30;
  ```

### NAME-004: 関数名
- **パターン**: `(public\s+)?(entry\s+)?fun\s+([A-Za-z_][A-Za-z0-9_]*)`
- **チェック**: snake_case
- **自動修正**: 不可能
- **メッセージ**: "Function name '$3' must be in snake_case"
- **例**:
  ```move
  // ❌ 違反
  public fun CreateObject() {}
  public fun getBalance() {}

  // ✅ 正しい
  public fun create_object() {}
  public fun get_balance() {}
  ```

---

## 3. コード構造 [WARNING]

### STRUCT-001: セクションコメント
- **パターン**: `^// === .+ ===$`
- **チェック**: 推奨セクションの存在
- **自動修正**: 可能（テンプレート挿入）
- **メッセージ**: "Consider using section comments to organize code"
- **推奨セクション**: Imports, Constants, Structs, Public Functions, Private Functions
- **例**:
  ```move
  // ✅ 推奨
  // === Imports ===
  use sui::object::UID;

  // === Constants ===
  const MAX_SIZE: u64 = 100;

  // === Structs ===
  public struct MyStruct has key { id: UID }
  ```

### STRUCT-002: 関数の順序
- **パターン**: 関数定義の順序をチェック
- **順序**: entry functions → public functions → private functions
- **自動修正**: 不可能
- **メッセージ**: "Functions should be ordered: entry, public, then private"

### STRUCT-003: Ability順序
- **パターン**: `has\s+((?:\w+(?:,\s*)?)+)`
- **正しい順序**: key, copy, drop, store
- **自動修正**: 可能
- **メッセージ**: "Abilities should be declared in order: key, copy, drop, store"
- **例**:
  ```move
  // ❌ 違反
  public struct MyStruct has store, key, drop {}

  // ✅ 正しい
  public struct MyStruct has key, drop, store {}
  ```

---

## 4. 推奨パターン [INFO]

### BEST-001: Method Syntax使用
- **パターン**: `(\w+)::(\w+)\(&(mut\s+)?(\w+)`
- **提案**: `$4.$2(`
- **自動修正**: 可能
- **メッセージ**: "Consider using method syntax: $4.$2()"
- **例**:
  ```move
  // 💡 改善提案
  vector::push_back(&mut v, item);

  // ✅ 推奨
  v.push_back(item);
  ```

### BEST-002: public(package)使用
- **パターン**: `friend\s+`
- **提案**: `public(package)`
- **自動修正**: 手動確認必要
- **メッセージ**: "friend is deprecated, consider using public(package) instead"
- **例**:
  ```move
  // ⚠️ 非推奨
  friend my_module::helper;
  public(friend) fun internal_function() {}

  // ✅ 推奨
  public(package) fun internal_function() {}
  ```

### BEST-003: ネストしたuse宣言
- **パターン**: 同じモジュールからの複数import
- **提案**: ネスト形式
- **自動修正**: 可能
- **メッセージ**: "Consider using nested use declarations"
- **例**:
  ```move
  // 💡 改善提案
  use sui::object;
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  // ✅ 推奨
  use sui::{
      object,
      transfer,
      tx_context::{Self, TxContext}
  };
  ```

---

## 5. セキュリティルール [ERROR]

### SEC-001: 危険な公開関数
- **パターン**: `public\s+fun\s+borrow_mut`
- **自動修正**: 不可能
- **メッセージ**: "Avoid exposing mutable references publicly - security risk"
- **例**:
  ```move
  // ❌ 危険
  public fun borrow_mut_data(self: &mut MyStruct): &mut SomeData {
      &mut self.data
  }

  // ✅ 安全
  public(package) fun borrow_mut_data(self: &mut MyStruct): &mut SomeData {
      &mut self.data
  }
  ```

### SEC-002: 未使用の危険な関数
- **パターン**: 使用されていない公開関数の検出
- **自動修正**: 不可能（要確認）
- **メッセージ**: "Unused public function '$1' - consider removing if not part of API"

---

## チェックリストモード

### 基本チェック項目
```yaml
Move2024Compliance:
  - [ ] M2024-001: すべての構造体にpublicキーワード
  - [ ] M2024-002: 再代入される変数にmutキーワード
  - [ ] M2024-003: モジュール宣言でセミコロン使用
  - [ ] M2024-004: 予約語の変数名使用なし

NamingConventions:
  - [ ] NAME-001: パッケージ名がPascalCase
  - [ ] NAME-002: エラー定数がEPascalCase
  - [ ] NAME-003: 通常定数がUPPER_SNAKE_CASE
  - [ ] NAME-004: 関数名がsnake_case

CodeStructure:
  - [ ] STRUCT-001: セクションコメント使用
  - [ ] STRUCT-002: 関数の適切な順序
  - [ ] STRUCT-003: Ability順序の統一

Security:
  - [ ] SEC-001: 公開可変参照の回避
  - [ ] SEC-002: 未使用公開関数の削除
```

---

## 使用例

### コマンドラインでの使用
```bash
# 全ルールチェック
claude "Review my Move code against MOVE-STYLE.md linter rules"

# 特定レベルのみチェック
claude "Check only ERROR level rules in my Move files"

# 特定ルールのみチェック
claude "Check M2024-* rules only"

# 自動修正提案
claude "Suggest auto-fixes for MOVE-STYLE.md violations"
```

### VS Code統合例
```json
{
  "claude.linter.rules": {
    "move-style": {
      "enabled": true,
      "severity": {
        "M2024-*": "error",
        "NAME-*": "error",
        "STRUCT-*": "warning",
        "BEST-*": "info"
      }
    }
  }
}
```

---

## 参考リンク

- **[Sui Move Conventions](https://docs.sui.io/concepts/sui-move-concepts/conventions)**
- **[Move 2024 Migration Guide](https://docs.sui.io/guides/developer/advanced/move-2024-migration)**
- **[Sui Move Style Guide](https://docs.sui.io/style-guide)**

**このガイドは Sui Move 2024.beta エディション対応のLinterルール定義です。**