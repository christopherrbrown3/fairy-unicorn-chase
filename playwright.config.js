import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',timeout:90000,expect:{timeout:15000},fullyParallel:false,workers:1,
  use:{baseURL:'http://127.0.0.1:4173',viewport:{width:1024,height:768},hasTouch:true,trace:'retain-on-failure'},
  projects:[{name:'chromium',use:{browserName:'chromium',launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}}},{name:'webkit',use:{browserName:'webkit'}}],
  webServer:{command:'node tools/serve.mjs',port:4173,reuseExistingServer:!process.env.CI},
});
