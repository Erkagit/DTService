// Modal Usage Examples

// Basic usage with default size (form - 640px max-width)
<Modal isOpen={isOpen} onClose={onClose} title="Basic Modal">
  <p>Content here</p>
</Modal>

// Small modal (384px max-width)
<Modal isOpen={isOpen} onClose={onClose} title="Small Modal" size="sm">
  <p>Compact content</p>
</Modal>

// Medium modal (448px max-width) - good for forms
<Modal isOpen={isOpen} onClose={onClose} title="Form Modal" size="md">
  <form>...</form>
</Modal>

// Large modal (512px max-width)
<Modal isOpen={isOpen} onClose={onClose} title="Large Modal" size="lg">
  <div>Larger content area</div>
</Modal>

// Extra large modal (576px max-width)
<Modal isOpen={isOpen} onClose={onClose} title="XL Modal" size="xl">
  <div>Even larger content</div>
</Modal>

// Full-width modal (edge-to-edge on mobile, centered on desktop)
<Modal isOpen={isOpen} onClose={onClose} title="Full Width Modal" size="full">
  <div>Full width content</div>
</Modal>

// With custom styling
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Custom Modal"
  size="lg"
  className="border-4 border-blue-500"
>
  <div>Custom styled modal</div>
</Modal>