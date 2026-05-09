import { Editor } from '@tiptap/react';
import { Box, IconButton } from '@mui/material';
import {
  FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered,
  Code as CodeIcon, TableChart as TableIcon, Image as ImageIcon,
} from '@mui/icons-material';

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const addImage = () => {
    const url = prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    const rows = prompt('Enter number of rows:', '3');
    if (!rows) return;
    const cols = prompt('Enter number of columns:', '3');
    if (!cols) return;

    const numRows = parseInt(rows, 10);
    const numCols = parseInt(cols, 10);

    if (!isNaN(numRows) && !isNaN(numCols) && numRows > 0 && numCols > 0) {
      editor.chain().focus().insertTable({ rows: numRows, cols: numCols, withHeaderRow: true }).run();
    } else {
      alert('Please enter valid, positive numbers for rows and columns.');
    }
  };

  return (
    <Box sx={{ p: 0.5, borderBottom: '1px solid #dee2e6' }}>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBold fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalic fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulleted fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumbered fontSize="small" /></IconButton>
      <IconButton size="small" onClick={addTable}><TableIcon fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}><CodeIcon fontSize="small" /></IconButton>
      <IconButton size="small" onClick={addImage}><ImageIcon fontSize="small" /></IconButton>
    </Box>
  );
}
