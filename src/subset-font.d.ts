declare module 'subset-font' {
  function subsetFont(
    input: Buffer,
    text: string,
    options?: { targetFormat?: string },
  ): Promise<Buffer>
  export default subsetFont
}
