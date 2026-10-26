/* NaNa Lab. PDF page merging without uploading source documents. */
(function (root) {
  'use strict';
  const LIMITS = Object.freeze({files: 20, totalBytes: 150 * 1024 * 1024, pages: 1000});
  function pageIndexes(input, count) {
    if (!Number.isInteger(count) || count < 1) throw new Error('페이지가 없는 PDF입니다.');
    if (!String(input || '').trim()) return Array.from({length: count}, (_, i) => i);
    const result = [], seen = new Set();
    for (const token of String(input).replace(/\s/g, '').split(',')) {
      if (!/^\d+(?:-\d+)?$/.test(token)) throw new Error('페이지 범위는 1,3-5처럼 입력하세요.');
      const [start, end = start] = token.split('-').map(Number);
      if (start < 1 || end > count || start > end) throw new Error(`페이지 범위는 1~${count} 안에서 입력하세요.`);
      for (let n = start; n <= end; n++) {
        if (seen.has(n)) throw new Error(`${n}페이지가 중복됐습니다.`);
        seen.add(n); result.push(n - 1);
      }
    }
    return result;
  }
  function validateFiles(files, minimum = 2) {
    if (files.length < minimum || files.length > LIMITS.files) throw new Error(`PDF 파일을 ${minimum}~${LIMITS.files}개 선택하세요.`);
    let bytes = 0;
    for (const file of files) {
      if (!/\.pdf$/i.test(file.name || '')) throw new Error('확장자가 .pdf인 파일만 사용할 수 있습니다.');
      if (!file.size) throw new Error(`빈 파일입니다: ${file.name}`);
      bytes += file.size;
    }
    if (bytes > LIMITS.totalBytes) throw new Error('선택한 파일의 합계가 150MB를 넘습니다. 파일을 나눠 처리하세요.');
  }
  async function merge(files, options = {}) {
    validateFiles(files);
    const lib = root.PDFLib || (typeof require === 'function' && require('./vendor/pdf-lib.min.js'));
    if (!lib) throw new Error('PDF 처리기를 불러오지 못했습니다. 페이지를 새로고침하세요.');
    const output = await lib.PDFDocument.create();
    let pages = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!new TextDecoder('latin1').decode(bytes.slice(0, 1024)).includes('%PDF-')) throw new Error(`PDF 형식이 아닙니다: ${file.name}`);
      let source;
      try { source = await lib.PDFDocument.load(bytes, {updateMetadata: false}); }
      catch (error) {
        if (/encrypt|password/i.test(String(error))) throw new Error(`암호가 설정된 PDF입니다. 원본에서 암호를 해제한 뒤 다시 선택하세요: ${file.name}`);
        throw new Error(`손상됐거나 읽을 수 없는 PDF입니다: ${file.name}`);
      }
      if (new TextDecoder('latin1').decode(bytes).includes('/ByteRange')) throw new Error(`전자서명 PDF는 서명을 유지해 결합할 수 없습니다: ${file.name}`);
      const form = source.getForm();
      if (form.getFields().length) {
        if (!options.flattenForms) throw new Error(`입력 양식이 있습니다. 아래의 양식 변환 동의 항목을 선택하거나 일반 PDF를 사용하세요: ${file.name}`);
        try { form.flatten({updateFieldAppearances: false}); }
        catch (_) { throw new Error(`입력 양식의 표시 상태를 안전하게 변환할 수 없습니다: ${file.name}`); }
      }
      const indexes = pageIndexes(options.ranges?.[i], source.getPageCount());
      pages += indexes.length;
      if (pages > LIMITS.pages) throw new Error(`한 번에 ${LIMITS.pages}페이지까지 합칠 수 있습니다.`);
      for (const page of await output.copyPages(source, indexes)) output.addPage(page);
      options.onProgress?.(i + 1, files.length);
    }
    output.setTitle('Combined PDF');
    output.setProducer('NaNa Lab PDF Merge (pdf-lib)');
    return {bytes: await output.save(), pages};
  }
  const api = {LIMITS, pageIndexes, validateFiles, merge};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PdfMerge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
