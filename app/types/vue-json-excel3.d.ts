declare module 'vue-json-excel3' {
  import type { ComponentPublicInstance, DefineComponent } from 'vue'

  const JsonExcel: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    string,
    Record<string, unknown>,
    Record<string, unknown>,
    ComponentPublicInstance
  >

  export default JsonExcel
}
