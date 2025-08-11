# XCLV Brand Analysis Extension - TODO

## 🚨 CRITICAL RESTORATION NEEDED

**Core Functionality Broken**: Interactive Mode toggle exists in popup but actual mouseover analysis is not working. Users expect to hover over text elements and see blur effect + "Analyze Content" button, but this is currently broken.

**Current State**: Extension has sophisticated floating panel and API integration, but the main interactive feature (hover → analyze individual text elements) is not functional.

---

## 🎯 PHASE 1: Fix Interactive Mode Toggle (CRITICAL)

### Step 1.1: Fix Popup Toggle UI
**File**: `popup.html`
- [ ] Change current toggle to clear ACTIVE/DISABLED button
- [ ] Replace text "Enable Interactive Mode" with toggle button showing current state
- [ ] Add visual indicator (green = ACTIVE, gray = DISABLED)
- [ ] Update button text to show "Interactive Mode: ACTIVE" or "Interactive Mode: DISABLED"

### Step 1.2: Fix Message Passing
**File**: `popup.js`
- [ ] Update `enableInteractiveMode()` method to send proper message format
- [ ] Update `disableInteractiveMode()` method to send proper message format
- [ ] Add state tracking variable `isInteractiveModeActive`
- [ ] Update toggle button visual state based on current mode
- [ ] Add notification feedback: "Interactive mode activated - hover over text elements"

### Step 1.3: Fix Content Script Message Handling
**File**: `content.js`
- [ ] Verify `handleMessage()` method properly handles 'enableInteractiveMode' action
- [ ] Verify `handleMessage()` method properly handles 'disableInteractiveMode' action
- [ ] Ensure `InteractiveContentAnalyzer` instance exists and methods are called
- [ ] Add console logging to verify messages are received

---

## 🎯 PHASE 2: Restore Mouseover Analysis (CRITICAL)

### Step 2.1: Complete InteractiveContentAnalyzer Class
**File**: `content.js`
- [ ] Implement missing `setupMouseListeners()` method:
  ```javascript
  setupMouseListeners() {
    document.addEventListener('mouseover', (e) => this.handleMouseOver(e));
    document.addEventListener('mouseout', (e) => this.handleMouseOut(e));
  }
  ```

### Step 2.2: Implement Text Element Detection
**File**: `content.js`
- [ ] Implement `shouldAnalyzeElement(element)` method:
  - Check if element contains text (minimum 20 characters)
  - Exclude UI elements (navigation, menus, buttons)
  - Target paragraphs, headings, spans with substantial text
  - Return true/false for analysis eligibility

### Step 2.3: Implement Hover Visual Effects
**File**: `content.js`
- [ ] Implement `handleMouseOver(event)` method:
  - Check if interactive mode is enabled
  - Check if element should be analyzed
  - Apply blur effect to element
  - Show "Analyze Content" button near element
  - Store reference to current element

### Step 2.4: Implement Hover Cleanup
**File**: `content.js`
- [ ] Implement `handleMouseOut(event)` method:
  - Remove blur effect from element
  - Hide "Analyze Content" button
  - Clear current element reference

### Step 2.5: Create Analyze Button
**File**: `content.js`
- [ ] Implement `showAnalyzeButton(element, event)` method:
  - Create floating button element
  - Position near hovered text element
  - Add click event listener
  - Style with XCLV branding
  - Show with smooth animation

- [ ] Implement `hideAnalyzeButton()` method:
  - Remove button from DOM
  - Clear event listeners
  - Clean up references

### Step 2.6: Add CSS Styles for Interactive Elements
**File**: `content-styles.css` or inject styles in `content.js`
- [ ] Add blur effect CSS class:
  ```css
  .xclv-analyzing-element {
    filter: blur(1px);
    transition: filter 0.2s ease;
  }
  ```
- [ ] Add analyze button styles:
  ```css
  .xclv-analyze-button {
    position: absolute;
    background: #2563eb;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    z-index: 9999;
    animation: xclv-button-appear 0.2s ease;
  }
  ```

---

## 🎯 PHASE 3: Connect Analysis Pipeline (CRITICAL)

### Step 3.1: Implement Button Click Handler
**File**: `content.js`
- [ ] Implement `handleAnalyzeButtonClick(element)` method:
  - Extract text content from element
  - Extract element context (surrounding text, page metadata)
  - Show loading state on button
  - Send analysis request to background service
  - Handle response and show results

### Step 3.2: Integrate with Existing Background Service
**File**: `content.js`
- [ ] Update analysis request to use existing message format:
  ```javascript
  const response = await this.sendMessageSafely({
    action: 'analyzeContent',
    data: {
      text: elementText,
      url: window.location.href,
      analysisTypes: ['tone-of-voice'] // Use existing ToV analysis
    }
  });
  ```

### Step 3.3: Verify Background Service Integration
**File**: `background.js`
- [ ] Verify 'analyzeContent' action handler exists
- [ ] Verify tone-of-voice-analysis.md prompt is loaded correctly
- [ ] Verify Gemini API integration is working
- [ ] Verify response format matches expected JSON structure

### Step 3.4: Extract Element Text Properly
**File**: `content.js`
- [ ] Implement `extractElementContent(element)` method:
  - Get element text content
  - Include surrounding context if needed
  - Clean up text (remove extra whitespace)
  - Ensure minimum text length for analysis
  - Return structured content object

---

## 🎯 PHASE 4: Results Display System (HIGH PRIORITY)

### Step 4.1: Create Analysis Results Popup
**File**: `content.js`
- [ ] Implement `showAnalysisResults(data, element)` method:
  - Create floating results popup
  - Position near analyzed element
  - Parse tone analysis JSON response
  - Display scores and recommendations
  - Add close button functionality

### Step 4.2: Parse Analysis Response
**File**: `content.js`
- [ ] Implement `parseAnalysisResponse(response)` method:
  - Extract tone scores from JSON
  - Extract brand personality description
  - Extract recommendations
  - Handle error responses gracefully
  - Format for display in popup

### Step 4.3: Style Results Popup
**File**: `content-styles.css` or inject styles
- [ ] Add results popup styles:
  ```css
  .xclv-results-popup {
    position: absolute;
    background: white;
    border: 2px solid #2563eb;
    border-radius: 12px;
    padding: 16px;
    max-width: 300px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    z-index: 10000;
  }
  ```

### Step 4.4: Add Results Content Layout
**File**: `content.js`
- [ ] Create HTML structure for results:
  - Header with "Analysis Results"
  - Tone scores section
  - Brand personality section
  - Recommendations section
  - Close button

---

## 🎯 PHASE 5: User Experience Polish (MEDIUM PRIORITY)

### Step 5.1: Add Loading States
**File**: `content.js`
- [ ] Show loading spinner on analyze button during API call
- [ ] Add loading text: "Analyzing content..."
- [ ] Disable button during analysis
- [ ] Re-enable button after response

### Step 5.2: Add Error Handling
**File**: `content.js`
- [ ] Handle API call failures gracefully
- [ ] Show error message in results popup
- [ ] Provide retry option
- [ ] Log errors for debugging

### Step 5.3: Add Smooth Animations
**File**: `content-styles.css`
- [ ] Animate button appearance/disappearance
- [ ] Animate blur effect on/off
- [ ] Animate results popup show/hide
- [ ] Add smooth transitions for all interactive elements

### Step 5.4: Implement Content Caching
**File**: `content.js`
- [ ] Cache analysis results by text content hash
- [ ] Check cache before making API calls
- [ ] Implement cache expiration
- [ ] Clear cache when interactive mode disabled

---

## 🎯 PHASE 6: Integration Testing (HIGH PRIORITY)

### Step 6.1: Test Complete User Flow
- [ ] **Test 1**: Enable interactive mode in popup → verify content script receives message
- [ ] **Test 2**: Hover over text element → verify blur effect appears
- [ ] **Test 3**: Verify "Analyze Content" button appears on hover
- [ ] **Test 4**: Click analyze button → verify API call is made
- [ ] **Test 5**: Verify analysis results are displayed correctly
- [ ] **Test 6**: Disable interactive mode → verify cleanup works properly

### Step 6.2: Test Error Scenarios
- [ ] Test with invalid API key
- [ ] Test with no internet connection
- [ ] Test with very short text elements
- [ ] Test with non-text elements
- [ ] Test rapid hover/unhover actions

### Step 6.3: Test Performance
- [ ] Test on pages with many text elements
- [ ] Verify no memory leaks during extended use
- [ ] Test event listener cleanup
- [ ] Verify smooth interactions on slow devices

---

## 🎯 PHASE 7: Documentation Updates (MEDIUM PRIORITY)

### Step 7.1: Update README.md
- [ ] Update feature description for interactive mode
- [ ] Add step-by-step usage instructions
- [ ] Update screenshots if needed
- [ ] Document new keyboard shortcuts

### Step 7.2: Update CHANGELOG.md
- [ ] Document all fixes made
- [ ] Update version to 1.2.11
- [ ] List breaking changes if any
- [ ] Add testing requirements section

### Step 7.3: Update manifest.json
- [ ] Increment version to 1.2.11
- [ ] Update description if needed
- [ ] Verify permissions are sufficient
- [ ] Test extension loading

---

## 🚨 CRITICAL SUCCESS CRITERIA

**Before marking as complete, verify this exact user flow works:**

1. User opens extension popup
2. User sees "Interactive Mode: DISABLED" button
3. User clicks button → changes to "Interactive Mode: ACTIVE"
4. User sees notification "Interactive mode activated - hover over text elements"
5. User hovers over text on webpage → text blurs + "Analyze Content" button appears
6. User clicks "Analyze Content" → button shows loading spinner
7. Analysis results popup appears with tone scores and recommendations
8. User can hover over different text elements and repeat process
9. User clicks "Interactive Mode: ACTIVE" → changes to "DISABLED"
10. All hover effects and buttons disappear

**This flow must work reliably on multiple websites before considering the restoration complete.**

---

## 📋 IMPLEMENTATION NOTES

### Development Order
1. **Start with Phase 1** - Get toggle working properly
2. **Move to Phase 2** - Get visual effects working
3. **Implement Phase 3** - Connect to analysis pipeline
4. **Complete Phase 4** - Add results display
5. **Polish with Phase 5** - Add UX improvements
6. **Test with Phase 6** - Comprehensive testing
7. **Document with Phase 7** - Update documentation

### Testing Strategy
- Test each phase independently before moving to next
- Use console.log extensively during development
- Test on multiple websites (simple blog, complex e-commerce, etc.)
- Test edge cases (very long text, very short text, etc.)

### Performance Considerations
- Minimize DOM queries in mouseover handlers
- Implement element caching where possible
- Clean up event listeners properly
- Avoid memory leaks during extended sessions

---

**Status**: Ready for implementation
**Next Action**: Begin Phase 1 implementation
**Target Version**: 1.2.11
**Priority**: CRITICAL - Core functionality restoration