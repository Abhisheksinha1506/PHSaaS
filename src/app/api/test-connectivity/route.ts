import { NextResponse } from 'next/server';
import { testApiConnectivity } from '@/lib/api';

export async function GET() {
  try {
    console.log('🧪 Testing API connectivity...');
    
    const connectivity = await testApiConnectivity();
    
    console.log('📊 API Connectivity Results:', connectivity);
    
    return NextResponse.json({
      success: true,
      connectivity,
      timestamp: new Date().toISOString(),
      message: 'API connectivity test completed'
    });
  } catch (error) {
    console.error('Error testing API connectivity:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test API connectivity',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
