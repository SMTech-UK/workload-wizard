import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Eye, 
  FileText, 
  Play, 
  Settings, 
  TestTube, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Package,
  Zap,
  Layout,
  Palette
} from 'lucide-react';

interface ComponentInfo {
  name: string;
  description: string;
  category: string;
  props: string[];
  file: string;
}

interface ComponentCardProps {
  component: ComponentInfo;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'UI':
        return <Palette className="w-4 h-4" />;
      case 'Layout':
        return <Layout className="w-4 h-4" />;
      case 'Feature':
        return <Package className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UI':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'Layout':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'Feature':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInEditor = () => {
    // This would typically open the file in the user's editor
    console.log(`Opening ${component.file} in editor`);
  };

  const runComponentTest = () => {
    // This would run tests for the specific component
    console.log(`Running tests for ${component.name}`);
  };

  const generateComponentPreview = () => {
    // Generate a preview of the component with sample props
    const sampleProps: Record<string, any> = {};
    
    component.props.forEach(prop => {
      if (prop.includes('title') || prop.includes('name')) {
        sampleProps[prop] = 'Sample Title';
      } else if (prop.includes('value') || prop.includes('count')) {
        sampleProps[prop] = 42;
      } else if (prop.includes('isOpen')) {
        sampleProps[prop] = true;
      } else if (prop.includes('on')) {
        sampleProps[prop] = () => console.log(`${prop} called`);
      } else if (prop.includes('data') || prop.includes('items')) {
        sampleProps[prop] = [];
      } else {
        sampleProps[prop] = 'Sample Value';
      }
    });

    return sampleProps;
  };

  const generateComponentCode = () => {
    const props = component.props.map(prop => `${prop}: any`).join(', ');
    const sampleProps = generateComponentPreview();
    const propsString = Object.entries(sampleProps)
      .map(([key, value]) => `  ${key}={${typeof value === 'string' ? `"${value}"` : value}}`)
      .join('\n');

    return `import React from 'react';
import { ${component.name} } from './${component.name}';

interface ${component.name}Props {
  ${props}
}

// Example usage:
export function ${component.name}Example() {
  return (
    <${component.name}
${propsString}
    />
  );
}`;
  };

  const generateTestCode = () => {
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${component.name} } from './${component.name}';

describe('${component.name}', () => {
  it('renders without crashing', () => {
    render(<${component.name} />);
    expect(screen.getByTestId('${component.name.toLowerCase()}')).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    const testProps = {
      title: 'Test Title',
      value: 'Test Value'
    };
    
    render(<${component.name} {...testProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const mockOnClick = jest.fn();
    render(<${component.name} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});`;
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{component.name}</span>
            </div>
            <Badge className={`text-xs ${getCategoryColor(component.category)}`}>
              {component.category}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {component.description}
          </p>
          
          <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
            {component.file}
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {component.props.slice(0, 3).map(prop => (
              <Badge key={prop} variant="outline" className="text-xs">
                {prop}
              </Badge>
            ))}
            {component.props.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{component.props.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCodeOpen(true)}
              className="flex-1"
            >
              <FileText className="w-3 h-3 mr-1" />
              Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTestOpen(true)}
              className="flex-1"
            >
              <TestTube className="w-3 h-3 mr-1" />
              Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {component.name} Preview
            </DialogTitle>
            <DialogDescription>
              Preview the component with sample data
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            <Tabs defaultValue="preview" className="flex-1">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="props">Props</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900 min-h-[300px]">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Component preview would render here</p>
                    <p className="text-sm mt-2">
                      {component.name} with sample props
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="props" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Available Props</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {component.props.map(prop => (
                          <div key={prop} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <span className="font-mono text-sm">{prop}</span>
                            <Badge variant="outline" className="text-xs">any</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Sample Props</h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                        <pre className="text-sm font-mono">
                          {JSON.stringify(generateComponentPreview(), null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Component Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-mono">{component.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <Badge className={getCategoryColor(component.category)}>
                          {component.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>File:</span>
                        <span className="font-mono text-sm">{component.file}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Props Count:</span>
                        <span>{component.props.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={openInEditor}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in Editor
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(component.file)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Path
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Component Code Modal */}
      <Dialog open={isCodeOpen} onOpenChange={setIsCodeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {component.name} Code
            </DialogTitle>
            <DialogDescription>
              View and copy component code examples
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            <Tabs defaultValue="usage" className="flex-1">
              <TabsList>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="interface">Interface</TabsTrigger>
                <TabsTrigger value="example">Example</TabsTrigger>
              </TabsList>
              
              <TabsContent value="usage" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded">
                    <pre className="text-sm font-mono">
                      {generateComponentCode()}
                    </pre>
                  </div>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                  <Button size="sm" onClick={() => copyToClipboard(generateComponentCode())}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Code
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="interface" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded">
                    <pre className="text-sm font-mono">
{`interface ${component.name}Props {
${component.props.map(prop => `  ${prop}: any;`).join('\n')}
}`}
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="example" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded">
                    <pre className="text-sm font-mono">
{`// Basic usage
<${component.name} />

// With props
<${component.name}
${component.props.slice(0, 3).map(prop => `  ${prop}="value"`).join('\n')}
/>`}
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Component Test Modal */}
      <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              {component.name} Tests
            </DialogTitle>
            <DialogDescription>
              View and run component tests
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            <Tabs defaultValue="test-code" className="flex-1">
              <TabsList>
                <TabsTrigger value="test-code">Test Code</TabsTrigger>
                <TabsTrigger value="run-tests">Run Tests</TabsTrigger>
                <TabsTrigger value="coverage">Coverage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="test-code" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded">
                    <pre className="text-sm font-mono">
                      {generateTestCode()}
                    </pre>
                  </div>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                  <Button size="sm" onClick={() => copyToClipboard(generateTestCode())}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Test Code
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="run-tests" className="mt-4">
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <TestTube className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-lg font-medium mb-2">Run Component Tests</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Test the {component.name} component in isolation
                    </p>
                    <Button onClick={runComponentTest}>
                      <Play className="w-4 h-4 mr-2" />
                      Run Tests
                    </Button>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded">
                    <h4 className="font-medium mb-2">Test Commands</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div>npm test -- --testNamePattern="{component.name}"</div>
                      <div>npm run test:coverage -- --testNamePattern="{component.name}"</div>
                      <div>npm run test:watch -- --testNamePattern="{component.name}"</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="coverage" className="mt-4">
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-lg font-medium mb-2">Test Coverage</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      View coverage metrics for {component.name}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded text-center">
                      <div className="text-2xl font-bold text-blue-600">85%</div>
                      <div className="text-sm text-blue-800 dark:text-blue-400">Statements</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded text-center">
                      <div className="text-2xl font-bold text-green-600">92%</div>
                      <div className="text-sm text-green-800 dark:text-green-400">Branches</div>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded text-center">
                      <div className="text-2xl font-bold text-yellow-600">78%</div>
                      <div className="text-sm text-yellow-800 dark:text-yellow-400">Functions</div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded text-center">
                      <div className="text-2xl font-bold text-purple-600">88%</div>
                      <div className="text-sm text-purple-800 dark:text-purple-400">Lines</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComponentCard; 