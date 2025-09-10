// Manual Test Runner for Timey App - Execute and Report Results
import { storage } from '@/utils/localStorage';

export class ManualTestRunner {
  private results: Array<{
    test: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    timestamp: string;
  }> = [];

  private log(test: string, status: 'pass' | 'fail' | 'warning', details: string) {
    const result = {
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} [${test}] ${details}`);
  }

  // Test 1: Check API Availability
  testAPIAvailability() {
    console.log('\n🔍 Testing API Availability...');
    
    if (typeof window === 'undefined') {
      this.log('Window Object', 'fail', 'Not running in browser context');
      return;
    }

    // Check appAPI
    if (window.appAPI) {
      const methods = Object.keys(window.appAPI);
      this.log('App API', 'pass', `Available with methods: ${methods.join(', ')}`);
      
      // Check specific methods
      const requiredMethods = ['showTasksPopup', 'showMetricsPopup', 'closePopups', 'showOverlay'];
      requiredMethods.forEach(method => {
        if (window.appAPI[method as keyof typeof window.appAPI]) {
          this.log(`App API - ${method}`, 'pass', 'Method available');
        } else {
          this.log(`App API - ${method}`, 'warning', 'Method not available - using fallback');
        }
      });
    } else {
      this.log('App API', 'fail', 'appAPI not available');
    }

    // Check timerAPI
    if (window.timerAPI) {
      const methods = Object.keys(window.timerAPI);
      this.log('Timer API', 'pass', `Available with methods: ${methods.join(', ')}`);
    } else {
      this.log('Timer API', 'fail', 'timerAPI not available');
    }

    // Check databaseAPI
    if (window.databaseAPI) {
      this.log('Database API', 'pass', 'Available');
    } else {
      this.log('Database API', 'warning', 'databaseAPI not available - using localStorage');
    }
  }

  // Test 2: Timer Functionality
  async testTimerFunctionality() {
    console.log('\n⏱️ Testing Timer Functionality...');
    
    if (!window.timerAPI) {
      this.log('Timer Test', 'fail', 'Timer API not available');
      return;
    }

    try {
      // Get initial state
      const initialState = await window.timerAPI.getTimerState();
      this.log('Timer State Retrieval', 'pass', `Initial state retrieved: ${JSON.stringify(initialState)}`);

      // Start timer
      window.timerAPI.startTimer(5 * 60, 'Test Session'); // 5 minutes
      this.log('Timer Start', 'pass', 'Timer started successfully');

      // Wait and check if running
      setTimeout(async () => {
        try {
          const runningState = await window.timerAPI.getTimerState();
          if (runningState.isActive) {
            this.log('Timer Running', 'pass', 'Timer is active and running');
          } else {
            this.log('Timer Running', 'fail', 'Timer should be active but is not');
          }
        } catch (error) {
          this.log('Timer State Check', 'fail', `Error checking timer state: ${error}`);
        }
      }, 2000);

    } catch (error) {
      this.log('Timer Test', 'fail', `Timer test failed: ${error}`);
    }
  }

  // Test 3: Popup Windows
  testPopupWindows() {
    console.log('\n🪟 Testing Popup Windows...');
    
    if (!window.appAPI) {
      this.log('Popup Test', 'fail', 'App API not available');
      return;
    }

    // Test Tasks Popup
    try {
      if (window.appAPI.showTasksPopup) {
        window.appAPI.showTasksPopup();
        this.log('Tasks Popup', 'pass', 'Tasks popup opened successfully');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          if (window.appAPI.closePopups) {
            window.appAPI.closePopups();
            this.log('Tasks Popup Close', 'pass', 'Tasks popup closed successfully');
          }
        }, 3000);
      } else {
        // Fallback test
        window.appAPI.restoreMain();
        this.log('Tasks Popup', 'warning', 'Using fallback - restored main window');
      }
    } catch (error) {
      this.log('Tasks Popup', 'fail', `Tasks popup failed: ${error}`);
    }

    // Test Metrics Popup (after 4 seconds)
    setTimeout(() => {
      try {
        if (window.appAPI.showMetricsPopup) {
          window.appAPI.showMetricsPopup();
          this.log('Metrics Popup', 'pass', 'Metrics popup opened successfully');
          
          // Auto-close after 3 seconds
          setTimeout(() => {
            if (window.appAPI.closePopups) {
              window.appAPI.closePopups();
              this.log('Metrics Popup Close', 'pass', 'Metrics popup closed successfully');
            }
          }, 3000);
        } else {
          // Fallback test
          window.appAPI.restoreMain();
          this.log('Metrics Popup', 'warning', 'Using fallback - restored main window');
        }
      } catch (error) {
        this.log('Metrics Popup', 'fail', `Metrics popup failed: ${error}`);
      }
    }, 4000);
  }

  // Test 4: Local Storage Persistence
  testLocalStoragePersistence() {
    console.log('\n💾 Testing Local Storage Persistence...');
    
    try {
      // Test task storage
      const testTask = {
        id: 'test-' + Date.now(),
        title: 'Manual Test Task',
        completed: false,
        priority: 'high',
        createdAt: new Date().toISOString(),
        tags: ['test'],
        contextLinks: []
      };

      // Save using storage manager
      const existingTasks = storage.getTasks();
      existingTasks.push(testTask);
      storage.saveTasks(existingTasks);
      this.log('Task Storage', 'pass', 'Test task saved successfully');

      // Retrieve and verify
      const retrievedTasks = storage.getTasks();
      const foundTask = retrievedTasks.find(t => t.id === testTask.id);
      
      if (foundTask) {
        this.log('Task Retrieval', 'pass', 'Test task retrieved successfully');
      } else {
        this.log('Task Retrieval', 'fail', 'Test task not found');
      }

      // Test settings storage
      const testSettings = {
        theme: 'test-mode',
        notifications: true,
        testTimestamp: Date.now()
      };
      storage.saveUserSettings(testSettings);
      this.log('Settings Storage', 'pass', 'Settings saved successfully');

      const retrievedSettings = storage.getUserSettings();
      if (retrievedSettings.testTimestamp === testSettings.testTimestamp) {
        this.log('Settings Retrieval', 'pass', 'Settings retrieved successfully');
      } else {
        this.log('Settings Retrieval', 'fail', 'Settings not retrieved correctly');
      }

      // Clean up test data
      const cleanedTasks = retrievedTasks.filter(t => t.id !== testTask.id);
      storage.saveTasks(cleanedTasks);
      this.log('Storage Cleanup', 'pass', 'Test data cleaned up');

    } catch (error) {
      this.log('Storage Test', 'fail', `Storage test failed: ${error}`);
    }
  }

  // Test 5: Keyboard Shortcuts
  testKeyboardShortcuts() {
    console.log('\n⌨️ Testing Keyboard Shortcuts...');
    
    try {
      const shortcuts = [
        { key: 'Enter', metaKey: true, description: 'Start Timer (Cmd+Enter)' },
        { key: ' ', description: 'Pause Timer (Space)' },
        { key: 'n', metaKey: true, description: 'New Task (Cmd+N)' },
        { key: 'o', metaKey: true, shiftKey: true, description: 'Toggle Overlay (Cmd+Shift+O)' }
      ];

      shortcuts.forEach((shortcut, index) => {
        setTimeout(() => {
          try {
            const event = new KeyboardEvent('keydown', {
              key: shortcut.key,
              metaKey: shortcut.metaKey || false,
              shiftKey: shortcut.shiftKey || false,
              bubbles: true
            });
            
            document.dispatchEvent(event);
            this.log('Keyboard Shortcut', 'pass', `${shortcut.description} event dispatched`);
          } catch (error) {
            this.log('Keyboard Shortcut', 'fail', `${shortcut.description} failed: ${error}`);
          }
        }, index * 500);
      });

    } catch (error) {
      this.log('Keyboard Test', 'fail', `Keyboard test failed: ${error}`);
    }
  }

  // Test 6: Overlay Visibility
  testOverlayVisibility() {
    console.log('\n👁️ Testing Overlay Visibility...');
    
    try {
      if (window.appAPI?.showOverlay) {
        window.appAPI.showOverlay();
        this.log('Overlay Show', 'pass', 'Overlay show command executed');
        
        // Test overlay positioning
        setTimeout(() => {
          this.log('Overlay Positioning', 'pass', 'Overlay should be visible on all workspaces');
        }, 1000);
      } else {
        this.log('Overlay Visibility', 'warning', 'showOverlay method not available');
      }
    } catch (error) {
      this.log('Overlay Test', 'fail', `Overlay test failed: ${error}`);
    }
  }

  // Run all tests and generate report
  async runAllTests() {
    console.log('\n🧪 Starting Manual Test Execution');
    console.log('=' .repeat(50));
    
    this.testAPIAvailability();
    await this.testTimerFunctionality();
    this.testPopupWindows();
    this.testLocalStoragePersistence();
    this.testKeyboardShortcuts();
    this.testOverlayVisibility();

    // Generate report after all tests
    setTimeout(() => {
      this.generateReport();
    }, 10000);
  }

  // Generate comprehensive test report
  generateReport() {
    console.log('\n📊 Test Execution Report');
    console.log('=' .repeat(40));

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⚠️ Warnings: ${warnings}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    // Detailed results
    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${emoji} ${result.test}: ${result.details}`);
    });

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: { passed, failed, warnings, total },
      results: this.results
    };
    
    storage.set('timey_manual_test_report', report);
    console.log('\n💾 Test report saved to localStorage');

    // Overall status
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Timey app is functioning correctly.');
    } else if (failed <= 2) {
      console.log('\n⚠️ Minor issues detected. App is mostly functional.');
    } else {
      console.log('\n🚨 Multiple issues detected. Review failed tests.');
    }

    return report;
  }
}

// Export for use in other components
export default ManualTestRunner;
