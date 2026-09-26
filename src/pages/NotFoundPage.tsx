import { Compass } from 'lucide-react';
import { Link } from 'react-router';

import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';
import { buttonClass } from '../lib/styles';

export default function NotFoundPage() {
  return (
    <Container className="max-w-xl pt-16">
      <EmptyState icon={Compass} title="Page not found">
        <p>That page doesn&apos;t exist, or it may have moved.</p>
        <Link className={`${buttonClass('primary')} mt-5`} to="/">
          Back to events
        </Link>
      </EmptyState>
    </Container>
  );
}
