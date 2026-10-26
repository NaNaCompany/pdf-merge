const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../core.js');
const {PDFDocument} = require('../vendor/pdf-lib.min.js');
fs.mkdirSync(path.join(__dirname,'output'),{recursive:true});
const fixture = name => {const bytes=fs.readFileSync(path.join(__dirname,'fixtures',name));return {name,size:bytes.length,arrayBuffer:async()=>bytes};};
test('page selection preserves explicit order and validates ranges',()=>{
  assert.deepEqual(core.pageIndexes('3,1-2',3),[2,0,1]); assert.deepEqual(core.pageIndexes('',2),[0,1]);
  for(const range of ['0','4','2-1','1,1','1,,2','1.5','<script>']) assert.throws(()=>core.pageIndexes(range,3));
});
test('merge independently generated PDF pages and retain geometry',async()=>{
  const result=await core.merge([fixture('alpha.pdf'),fixture('beta.pdf')]);assert.equal(result.pages,3);
  const output=await PDFDocument.load(result.bytes);assert.equal(output.getPageCount(),3);
  assert.ok(output.getPage(0).getWidth()<output.getPage(0).getHeight());assert.ok(output.getPage(2).getWidth()>output.getPage(2).getHeight());
  fs.writeFileSync(path.join(__dirname,'output','combined.pdf'),result.bytes);
});
test('custom file order and page ranges',async()=>{
  const result=await core.merge([fixture('beta.pdf'),fixture('alpha.pdf')],{ranges:['1','2']});assert.equal(result.pages,2);
  fs.writeFileSync(path.join(__dirname,'output','reordered.pdf'),result.bytes);
});
test('reject encrypted, malformed, empty and incorrectly named input',async()=>{
  for(const name of ['encrypted.pdf','fake.pdf']) await assert.rejects(core.merge([fixture('alpha.pdf'),fixture(name)]));
  assert.throws(()=>core.validateFiles([{name:'bad.txt',size:1},{name:'a.pdf',size:1}]));
  assert.throws(()=>core.validateFiles([{name:'a.pdf',size:0},{name:'b.pdf',size:1}]));
  assert.throws(()=>core.validateFiles([fixture('alpha.pdf')]));
  assert.throws(()=>core.validateFiles([{name:'a.pdf',size:160*1024*1024},{name:'b.pdf',size:1}]));
});
test('interactive forms require explicit flatten consent',async()=>{
  await assert.rejects(core.merge([fixture('alpha.pdf'),fixture('form.pdf')]),/양식/);
  const result=await core.merge([fixture('alpha.pdf'),fixture('form.pdf')],{flattenForms:true});
  const output=await PDFDocument.load(result.bytes);assert.equal(output.getForm().getFields().length,0);
  fs.writeFileSync(path.join(__dirname,'output','flattened.pdf'),result.bytes);
});
