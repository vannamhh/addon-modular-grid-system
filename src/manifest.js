export default {
  manifest_version: 3,
  name: 'WP 14px Rhythm Inspector',
  version: '1.0.0',
  description: 'Inspect 14px grid alignment on WordPress elements. Features 60fps performance, clean lifecycle management, and zero memory leaks.',
  
  permissions: ['activeTab', 'storage'],
  
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'src/assets/icon-16.png',
      '32': 'src/assets/icon-32.png',
      '48': 'src/assets/icon-48.png',
      '128': 'src/assets/icon-128.png'
    }
  },
  
  icons: {
    '16': 'src/assets/icon-16.png',
    '32': 'src/assets/icon-32.png',
    '48': 'src/assets/icon-48.png',
    '128': 'src/assets/icon-128.png'
  },
  
  background: {
    service_worker: 'src/background/index.js',
    type: 'module'
  },
  
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.js'],
      run_at: 'document_idle'
    }
  ]
};
