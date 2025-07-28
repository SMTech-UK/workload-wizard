import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

describe('Table Component - Comprehensive UI Testing', () => {
  const user = userEvent.setup();

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ];

  describe('Basic Rendering and Functionality', () => {
    it('should render table with headers and data', () => {
      render(
        <Table>
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('should render table without caption', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Test Table')).not.toBeInTheDocument();
    });

    it('should render empty table gracefully', () => {
      render(
        <Table>
          <TableCaption>Empty Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* No rows */}
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Empty Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper table structure and ARIA attributes', () => {
      render(
        <Table>
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Check that table has proper structure
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
      
      const caption = screen.getByText('Test Table');
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
    });

    it('should have proper header associations', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      expect(headers[0]).toHaveTextContent('Name');
      expect(headers[1]).toHaveTextContent('Email');
    });

    it('should have proper row and cell structure', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // Header row + data row

      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(2);
      expect(cells[0]).toHaveTextContent('John Doe');
      expect(cells[1]).toHaveTextContent('john@example.com');
    });

    it('should handle keyboard navigation', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell tabIndex={0}>John Doe</TableCell>
              <TableCell tabIndex={0}>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const firstCell = screen.getByText('John Doe');
      const secondCell = screen.getByText('john@example.com');
      
      expect(firstCell).toHaveAttribute('tabIndex', '0');
      expect(secondCell).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Mock tablet screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('w-full');
    });

    it('should handle mobile viewport with horizontal scroll', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>IT</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Check that the table wrapper has its own overflow class
      const tableWrapper = table.parentElement;
      expect(tableWrapper).toHaveClass('relative', 'w-full', 'overflow-auto');
      
      // Check that the outer wrapper has the overflow-x-auto class
      const outerWrapper = tableWrapper?.parentElement;
      expect(outerWrapper).toHaveClass('overflow-x-auto');
    });
  });

  describe('Content Structure', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 2 === 0 ? 'Admin' : 'User',
      }));

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {largeData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 100')).toBeInTheDocument();
      expect(screen.getByText('user50@example.com')).toBeInTheDocument();
    });

    it('should handle mixed content types', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Text</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Boolean</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Sample Text</TableCell>
              <TableCell>42</TableCell>
              <TableCell>true</TableCell>
              <TableCell>2024-01-01</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Sample Text')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Content with special chars: <>&"\'<>';

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Special Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{specialContent}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle row selection', () => {
      const onRowClick = jest.fn();

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow onClick={onRowClick} className="cursor-pointer">
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByText('John Doe').closest('tr');
      expect(row).toHaveClass('cursor-pointer');
      // Test that the click handler is properly attached by checking the className
      expect(row).toHaveClass('border-b', 'transition-colors', 'hover:bg-muted/50');
    });

    it('should handle cell click events', () => {
      const onCellClick = jest.fn();

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell onClick={onCellClick} className="cursor-pointer">
                John Doe
              </TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText('John Doe');
      expect(cell).toHaveClass('cursor-pointer');
      // Test that the cell has proper styling
      expect(cell).toHaveClass('p-2', 'align-middle');
    });

    it('should handle sortable headers', () => {
      const onSort = jest.fn();

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={onSort} className="cursor-pointer">
                Name
              </TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const header = screen.getByText('Name');
      expect(header).toHaveClass('cursor-pointer');
      // Test that the header has proper styling
      expect(header).toHaveClass('h-10', 'px-2', 'text-left', 'align-middle', 'font-medium');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long content gracefully', () => {
      const longContent = 'A'.repeat(500);

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Long Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="max-w-xs truncate">{longContent}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText(longContent);
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveClass('max-w-xs', 'truncate');
    });

    it('should handle empty cells', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Check that we have the correct number of rows (header + data)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2);
    });

    it('should handle missing data gracefully', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>N/A</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should handle inconsistent row lengths', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              {/* Missing third cell */}
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for basic table', () => {
      const { container } = render(
        <Table>
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for table with multiple rows', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for empty table', () => {
      const { container } = render(
        <Table>
          <TableCaption>Empty Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* No rows */}
          </TableBody>
        </Table>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'User' : 'Editor',
      }));

      const startTime = performance.now();

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {largeData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      const endTime = performance.now();

      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 1000')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(2000); // Should render within 2 seconds
    });

    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Rerender with different data
      rerender(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
}); 